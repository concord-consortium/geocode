import {
  Cartesian2, Cartesian3, Cartographic, CesiumWidget, Math as CSMath, HeadingPitchRange, sampleTerrainMostDetailed
} from "@cesium/engine";
import { useCallback, useEffect, useState } from "react";
import { IOnDragArgs, useCesiumDragEvents } from "./use-cesium-drag-events";

export type CameraMode = "pitch" | "heading" | "panning";

export const kDefaultCameraMode = "panning";

const kInitialLookAtLng = -155.5;
const kInitialLookAtLat = 19.40;
const kInitialCameraHeading = CSMath.toRadians(0.0); // looking north
const kMinCameraPitch = CSMath.toRadians(-89); // -90 degrees pitch leads to discontinuity in Cesium
const kInitialCameraPitch = CSMath.toRadians(-50.0); // pitch down
const kMaxCameraPitch = CSMath.toRadians(-15); // -15 degrees pitch is a reasonable limit for viewing the terrain
const kMinDistanceAboveTerrain = 1000;
const kInitialCameraRange = 130000;
const kMaxDistanceAboveTerrain = 140000;

function getAngleFromCenter(pos: Cartesian2, center: Cartesian2) {
  return Math.atan2(pos.y - center.y, pos.x - center.x);
}

export function useCameraControls(viewer: CesiumWidget | null, verticalExaggeration: number) {

  const [cameraMode, setCameraMode] = useState<CameraMode>(kDefaultCameraMode);

  const setDefaultCameraView = useCallback(() => {
    if (!viewer) return;

    const { camera } = viewer;
    camera.lookAt(
      Cartesian3.fromDegrees(kInitialLookAtLng, kInitialLookAtLat),
      new HeadingPitchRange(kInitialCameraHeading, kInitialCameraPitch, kInitialCameraRange)
    );
  }, [viewer]);

  const handlePan = useCallback(({ dx, dy }: IOnDragArgs) => {
    if (!viewer) return;

    const { camera } = viewer;

    // Adjust the sensitivity as needed
    const panFactor = 1 / 1000;

    // Pan the camera: moveRight and moveUp are in meters, so you may want to scale by camera height
    const moveRate = camera.positionCartographic.height * panFactor;
    camera.moveRight(-dx * moveRate);
    camera.moveUp(dy * moveRate);
  }, [viewer]);

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
  }, [viewer]);

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
  }, [viewer]);

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
    const [sampled] = await sampleTerrainMostDetailed(terrainProvider, [
      new Cartographic(cameraPos.longitude, cameraPos.latitude)
    ]);
    const terrainHeight = (sampled.height ?? 0) * verticalExaggeration;

    moveDist = Math.max(0, Math.min(moveDist, cameraPos.height - (terrainHeight + kMinDistanceAboveTerrain)));
    viewer.camera.moveForward(moveDist);
  }

  function zoomOut() {
    let moveDist = cameraZoomRate();
    if (!viewer || !moveDist) return;

    const cameraPos = viewer.camera.positionCartographic;
    moveDist = Math.min(moveDist, kMaxDistanceAboveTerrain - cameraPos.height);
    viewer.camera.moveBackward(moveDist);
  }

  useEffect(() => {
    if (viewer) {
      // Set the initial camera view
      setDefaultCameraView();

      // Disable the default camera controls
      viewer.scene.screenSpaceCameraController.enableLook = false;
      viewer.scene.screenSpaceCameraController.enableRotate = false;
      viewer.scene.screenSpaceCameraController.enableTilt = false;
      viewer.scene.screenSpaceCameraController.enableTranslate = false;
      viewer.scene.screenSpaceCameraController.enableZoom = false;
    }
  }, [setDefaultCameraView, viewer]);

  return { cameraMode, setCameraMode, setDefaultCameraView, zoomIn, zoomOut };
}
