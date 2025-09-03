import { Cartesian2, Cartesian3, CesiumWidget } from "@cesium/engine";

export interface ICameraState {
  center: Cartesian2;
  target: Cartesian3;
  cameraPositionECEF: Cartesian3;
  cameraOffsetECEF: Cartesian3;
  initialHeading: number;
  initialPitch: number;
  initialRange: number;
}

export function getCameraState(viewer: CesiumWidget | null): ICameraState | undefined {
  if (!viewer) return;

  const { camera, scene } = viewer;

  // 1. Find the target point at the center of the screen
  const canvas = scene.canvas;
  const center = new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);
  const ray = camera.getPickRay(center);
  if (!ray) return;
  const target = scene.globe.pick(ray, scene);

  if (!target) return; // Can't rotate if we don't have a target

  const cameraPositionECEF = camera.positionWC;
  const cameraOffsetECEF = Cartesian3.subtract(camera.positionWC, target, new Cartesian3());
  const initialHeading = camera.heading;
  const initialPitch = camera.pitch;
  const initialRange = Cartesian3.magnitude(cameraOffsetECEF);

  return {
    center, target,
    cameraPositionECEF, cameraOffsetECEF,
    initialHeading, initialPitch, initialRange
  };
}
