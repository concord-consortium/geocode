import { Cartesian2, Cartesian3, CesiumWidget, Math as CSMath, HeadingPitchRange } from "@cesium/engine";
import { reaction } from "mobx";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import { uiStore } from "../../stores/ui-store";
import { getCameraState } from "./cesium-utils";
import { IOnDragArgs, useCesiumDragEvents } from "./use-cesium-drag-events";
import { useTerrainProvider } from "./use-terrain-provider";

export type CameraMode = "pitch" | "heading" | "panning";

export const kDefaultCameraMode = "panning";

const kInitialLookAtLng = -155.45;
const kInitialLookAtLat = 19.40;
const kInitialCameraHeading = CSMath.toRadians(0.0); // looking north
export const kMinCameraPitch = CSMath.toRadians(-89.9); // -90 degrees pitch leads to discontinuity in Cesium
export const kInitialCameraPitch = CSMath.toRadians(-50.0); // pitch down
const kMaxCameraPitch = CSMath.toRadians(-15); // -15 degrees pitch is a reasonable limit for viewing the terrain
const kMinDistanceAboveTerrain = 1000;
const kInitialCameraRange = 130000;
const kMaxDistanceAboveTerrain = 140000;

function getAngleFromCenter(pos: Cartesian2, center: Cartesian2) {
  return Math.atan2(pos.y - center.y, pos.x - center.x);
}

export function useCameraControls(viewer: CesiumWidget | null, verticalExaggeration: number) {

  const [cameraMode, setCameraMode] = useState<CameraMode>(kDefaultCameraMode);
  const animationInterval = useRef<number | null>(null);
  const cameraChangeReceivers = useRef<Map<string, () => void>>(new Map());

  const { getElevation } = useTerrainProvider();

  // Cesium doesn't always send a camera changed event for client-triggered changes,
  // so we provide our own mechanism to listen for camera changes.
  const listenToCameraChange = useCallback((callback: () => void) => {
    const id = uuid();
    cameraChangeReceivers.current.set(id, callback);

    return () => {
      cameraChangeReceivers.current.delete(id);
    };
  }, []);

  const notifyCameraChange = useCallback(() => {
    cameraChangeReceivers.current.forEach(cb => cb());
  }, []);

  useEffect(() => {
    if (!viewer) return;

    function handleCameraChanged() {
      notifyCameraChange();
    }

    viewer.camera.changed.addEventListener(handleCameraChanged);

    return () => {
      viewer.camera.changed.removeEventListener(handleCameraChanged);
    };
  }, [notifyCameraChange, viewer]);

  const setDefaultCameraView = useCallback(() => {
    if (!viewer) return;

    const { camera } = viewer;
    camera.lookAt(
      Cartesian3.fromDegrees(kInitialLookAtLng, kInitialLookAtLat),
      new HeadingPitchRange(kInitialCameraHeading, kInitialCameraPitch, kInitialCameraRange)
    );
    notifyCameraChange();
  }, [notifyCameraChange, viewer]);

  const animateToCameraPitch = useCallback((pitch: number, exaggeration: number) => {
    if (!viewer) return;

    const kAnimationSteps = 20;
    const kAnimationFrame = 30; // ms per frame

    const { target, initialHeading, initialPitch, initialRange } = getCameraState(viewer) || {};
    if (target == null || initialHeading == null || initialPitch == null || initialRange == null) return;

    let currentPitch = initialPitch;
    const deltaPitch = (pitch - initialPitch) / kAnimationSteps;

    let currentExaggeration = uiStore.verticalExaggeration;
    const deltaExaggeration = (exaggeration - currentExaggeration) / kAnimationSteps;

    if (animationInterval.current) {
      window.clearInterval(animationInterval.current);
      animationInterval.current = null;
    }

    const interval = animationInterval.current = window.setInterval(() => {
      currentPitch += deltaPitch;
      currentExaggeration += deltaExaggeration;
      if (Math.abs(currentPitch - pitch) < 0.01) {
        window.clearInterval(interval);
        animationInterval.current = null;
        currentPitch = pitch;
        uiStore.setTempVerticalExaggeration(exaggeration === 1 ? exaggeration : undefined);
      }
      else {
        uiStore.setTempVerticalExaggeration(currentExaggeration);
      }
      viewer.camera.lookAt(target, new HeadingPitchRange(
        initialHeading,
        currentPitch,
        initialRange
      ));
      notifyCameraChange();
    }, kAnimationFrame);
  }, [notifyCameraChange, viewer]);

  useEffect(() => {
    return () => {
      if (animationInterval.current) {
        window.clearInterval(animationInterval.current);
        animationInterval.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return reaction(
      () => lavaSimulation.resetCount,
      () => setDefaultCameraView()
    );
  }, [setDefaultCameraView]);

  const handlePan = useCallback(({ dx, dy }: IOnDragArgs) => {
    if (!viewer) return;

    const { camera } = viewer;

    // Adjust the sensitivity as needed
    const panFactor = 1 / 1000;

    // Pan the camera: moveRight and moveUp are in meters, so you may want to scale by camera height
    const moveRate = camera.positionCartographic.height * panFactor;
    camera.moveRight(-dx * moveRate);
    camera.moveUp(dy * moveRate);
    notifyCameraChange();
  }, [notifyCameraChange, viewer]);

  const handleRotateHeading = useCallback(({ startPosition, position, initialCameraState }: IOnDragArgs) => {
    if (!viewer) return;

    const { camera } = viewer;
    const { center, target, initialHeading, initialPitch, initialRange } = initialCameraState;

    const prevAngle = getAngleFromCenter(startPosition, center);
    const currAngle = getAngleFromCenter(position, center);
    const deltaTheta = currAngle - prevAngle; // Radians, positive is CCW

    camera.lookAt(target, new HeadingPitchRange(
      initialHeading - deltaTheta,
      initialPitch,
      initialRange
    ));
    notifyCameraChange();
  }, [notifyCameraChange, viewer]);

  const handleRotatePitch = useCallback(({ dyTotal, initialCameraState }: IOnDragArgs) => {
    if (!viewer) return;

    const { camera } = viewer;
    const { target, initialHeading, initialPitch, initialRange } = initialCameraState;

    const pitchFactor = 0.01;

    camera.lookAt(target, new HeadingPitchRange(
      initialHeading,
      // -89 to avoid discontinuity at -90 degrees pitch
      CSMath.clamp(initialPitch - dyTotal * pitchFactor, kMinCameraPitch, kMaxCameraPitch),
      initialRange
    ));
    notifyCameraChange();
  }, [notifyCameraChange, viewer]);

  const dragHandlers: Record<CameraMode, (args: IOnDragArgs) => void> = {
    panning: handlePan,
    heading: handleRotateHeading,
    pitch: handleRotatePitch
  };
  const handleDrag = dragHandlers[cameraMode];

  useCesiumDragEvents(viewer, handleDrag);

  function cameraZoomRate() {
    if (!viewer) return;
    const cameraPos = viewer.camera.positionCartographic;
    return cameraPos.height / 5;
  }

  async function zoomIn() {
    let moveDist = cameraZoomRate();
    if (!viewer || !moveDist) return;

    // Sample the terrain at the camera's lat/lon
    const terrainProvider = viewer.terrainProvider;
    if (!terrainProvider) return;

    // Cesium expects an array of Cartographic
    const cameraPos = viewer.camera.positionCartographic;
    const elevation = await getElevation(cameraPos.longitude, cameraPos.latitude);
    const terrainHeight = (elevation ?? 0) * verticalExaggeration;

    moveDist = Math.max(0, Math.min(moveDist, cameraPos.height - (terrainHeight + kMinDistanceAboveTerrain)));
    viewer.camera.moveForward(moveDist);
    notifyCameraChange();
  }

  function zoomOut() {
    let moveDist = cameraZoomRate();
    if (!viewer || !moveDist) return;

    const cameraPos = viewer.camera.positionCartographic;
    moveDist = Math.min(moveDist, kMaxDistanceAboveTerrain - cameraPos.height);
    viewer.camera.moveBackward(moveDist);
    notifyCameraChange();
  }

  useEffect(() => {
    if (viewer) {
      // Set the initial camera view
      setDefaultCameraView();

      const controller = viewer.scene.screenSpaceCameraController;

      // Disable the default camera controls...
      controller.enableLook = false;
      controller.enableRotate = false;
      controller.enableTilt = false;
      controller.enableTranslate = false;
      // ...except for zoom, which we enable and constrain
      controller.enableZoom = true;
      controller.minimumZoomDistance = kMinDistanceAboveTerrain;
      controller.maximumZoomDistance = kMaxDistanceAboveTerrain;
    }
  }, [setDefaultCameraView, viewer]);

  return {
    cameraMode, isAnimating: !!animationInterval.current, animateToCameraPitch,
    listenToCameraChange, setCameraMode, setDefaultCameraView, zoomIn, zoomOut
  };
}
