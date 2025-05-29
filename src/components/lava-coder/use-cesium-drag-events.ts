import { Cartesian2, Cartesian3, CesiumWidget, ScreenSpaceEventHandler, ScreenSpaceEventType } from "@cesium/engine";
import { useEffect, useRef } from "react";

export interface ICameraState {
  center: Cartesian2;
  target: Cartesian3;
  cameraPositionECEF: Cartesian3;
  cameraOffsetECEF: Cartesian3;
  initialHeading: number;
  initialPitch: number;
  initialRange: number;
}

export interface IOnDragArgs {
  dx: number;
  dy: number;
  dxTotal: number;
  dyTotal: number;
  startPosition: Cartesian2;
  prevPosition: Cartesian2;
  position: Cartesian2;
  initialCameraState: ICameraState;
}

function getCameraState(viewer: CesiumWidget | null): ICameraState | undefined {
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

export function useCesiumDragEvents(viewer: CesiumWidget | null, onDrag?: (args: IOnDragArgs) => void) {
  const dragging = useRef(false);
  const startPosition = useRef<Cartesian2 | null>(null);
  const prevPosition = useRef<Cartesian2 | null>(null);
  const initialCameraState = useRef<ICameraState | undefined>(undefined);

  useEffect(() => {
    if (!viewer || !onDrag) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      dragging.current = true;
      startPosition.current = Cartesian2.clone(event.position);
      prevPosition.current = Cartesian2.clone(event.position);
      initialCameraState.current = getCameraState(viewer);
    }, ScreenSpaceEventType.LEFT_DOWN);

    handler.setInputAction((event: ScreenSpaceEventHandler.MotionEvent) => {
      if (!dragging.current || !startPosition.current || !prevPosition.current || !initialCameraState.current) return;
      const newPosition = event.endPosition;
      const dxTotal = newPosition.x - startPosition.current.x;
      const dyTotal = newPosition.y - startPosition.current.y;
      const dx = newPosition.x - prevPosition.current.x;
      const dy = newPosition.y - prevPosition.current.y;
      onDrag?.({
        dx, dy, dxTotal, dyTotal, startPosition: startPosition.current, prevPosition: prevPosition.current,
        position: newPosition, initialCameraState: initialCameraState.current });

      prevPosition.current = Cartesian2.clone(newPosition);
    }, ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(() => {
      dragging.current = false;
      prevPosition.current = null;
      initialCameraState.current = undefined;
    }, ScreenSpaceEventType.LEFT_UP);

    return () => {
      handler.destroy();
    };
  }, [viewer, onDrag]);
}
