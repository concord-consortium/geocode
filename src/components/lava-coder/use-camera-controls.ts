import { Cartesian3, Cartographic, CesiumWidget, Math as CSMath, sampleTerrainMostDetailed } from "@cesium/engine";
import { useEffect } from "react";

const kDefaultXLng = -155.470;
const kDefaultYLat = 19.150;
const kMinDistanceAboveTerrain = 500;
const kMaxDistanceAboveTerrain = 130000;

export function useCameraControls(viewer: CesiumWidget | null, verticalExaggeration: number) {

  function cameraMoveRate() {
    if (!viewer) return;
    const cameraPos = viewer.camera.positionCartographic;
    return cameraPos.height / 5;
  }

  async function zoomIn() {
    let moveDist = cameraMoveRate();
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
    let moveDist = cameraMoveRate();
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
      viewer.scene.screenSpaceCameraController.enableZoom = false;
    }
  }, [viewer]);

  return { zoomIn, zoomOut };
}
