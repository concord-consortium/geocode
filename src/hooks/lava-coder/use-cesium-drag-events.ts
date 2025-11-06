import { Cartesian2, CesiumWidget, ScreenSpaceEventHandler, ScreenSpaceEventType } from "@cesium/engine";
import { useEffect, useRef } from "react";
import { getCameraState, ICameraState } from "../../utilities/cesium-utils";

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
