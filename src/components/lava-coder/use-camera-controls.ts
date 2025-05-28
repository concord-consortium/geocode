import {
  Cartesian2, Cartesian3, Cartographic, CesiumWidget, Math as CSMath, HeadingPitchRange, sampleTerrainMostDetailed
} from "@cesium/engine";
import { useCallback, useEffect, useState } from "react";
import { IOnDragArgs, useCesiumDragEvents } from "./use-cesium-drag-events";

export const kDefaultCameraMode = "panning";

const kDefaultXLng = -155.470;
const kDefaultYLat = 19.150;
const kMinDistanceAboveTerrain = 1000;
const kMaxDistanceAboveTerrain = 135000;

function getAngleFromCenter(pos: Cartesian2, center: Cartesian2) {
  return Math.atan2(pos.y - center.y, pos.x - center.x);
}

export function useCameraControls(viewer: CesiumWidget | null, verticalExaggeration: number) {

  const [cameraMode, setCameraMode] = useState<"pitch" | "heading" | "panning">(kDefaultCameraMode);

  const handlePan = useCallback(({ dx, dy }: IOnDragArgs) => {
    if (!viewer) return;

    const { camera } = viewer;

    // Adjust the sensitivity as needed
    const panFactor = 0.5;

    // Pan the camera: moveRight and moveUp are in meters, so you may want to scale by camera height
    const moveRate = camera.positionCartographic.height / 500 * panFactor;
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
      CSMath.clamp(initialPitch - dyTotal * pitchFactor, CSMath.toRadians(-89), CSMath.toRadians(-15)),
      initialRange
    ));
  }, [viewer]);

  const handleDrag = cameraMode === "panning"
                      ? handlePan
                      : cameraMode === "heading"
                        ? handleRotateHeading
                        : cameraMode === "pitch"
                          ? handleRotatePitch
                          : undefined;

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
      const camera = viewer.camera;

      // Fly the camera to Hawaii at the initial longitude, latitude, and height when the simulation first loads.
      camera.flyTo({
        destination: Cartesian3.fromDegrees(kDefaultXLng, kDefaultYLat, kMaxDistanceAboveTerrain),
        orientation: {
          heading: CSMath.toRadians(0.0),
          pitch: CSMath.toRadians(-75.0),
        },
        // move instantaneously to the destination
        easingFunction: () => 1
      });

      // Disable the default camera controls
      viewer.scene.screenSpaceCameraController.enableLook = false;
      viewer.scene.screenSpaceCameraController.enableRotate = false;
      viewer.scene.screenSpaceCameraController.enableTilt = false;
      viewer.scene.screenSpaceCameraController.enableTranslate = false;
      viewer.scene.screenSpaceCameraController.enableZoom = false;
    }
  }, [viewer]);

  return { cameraMode, setCameraMode, zoomIn, zoomOut };
}
