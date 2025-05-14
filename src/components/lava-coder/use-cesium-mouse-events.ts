import {
  Cartesian2, Cartographic, CesiumWidget, Math as CSMath, ScreenSpaceEventHandler, ScreenSpaceEventType
} from "@cesium/engine";
import { useEffect } from "react";

type CartographicEventCallback = (latitude: number, longitude: number, elevation: number) => void;

interface ScreenSpaceHandlers {
  handleMouseMove?: ScreenSpaceEventHandler;
  handleClick?: ScreenSpaceEventHandler;
}

export function fromCartesian2(viewer: CesiumWidget | null, position?: Cartesian2) {
  if (viewer && position) {
    const cartesian = viewer.scene.pickPosition(position);
    if (cartesian) {
      const cartographic = Cartographic.fromCartesian(cartesian);
      const latitude = CSMath.toDegrees(cartographic.latitude);
      const longitude = CSMath.toDegrees(cartographic.longitude);
      const elevation = cartographic.height;
      return { latitude, longitude, elevation };
    }
  }
  return {};
}

export function useCesiumMouseEvents(
  viewer: CesiumWidget | null,
  onMouseMove?: CartographicEventCallback,
  onClick?: CartographicEventCallback) {
  useEffect(() => {
    if (viewer) {
      const screenSpaceHandlers: ScreenSpaceHandlers = {};
      if (onMouseMove) {
        screenSpaceHandlers.handleMouseMove = new ScreenSpaceEventHandler(viewer.scene.canvas);
        screenSpaceHandlers.handleMouseMove.setInputAction((event: ScreenSpaceEventHandler.MotionEvent) => {
          const { latitude, longitude, elevation } = fromCartesian2(viewer, event.endPosition);
          if (latitude != null && longitude != null && elevation != null) {
            onMouseMove(latitude, longitude, elevation);
          }
        }, ScreenSpaceEventType.MOUSE_MOVE);
      }
      if (onClick) {
        screenSpaceHandlers.handleClick = new ScreenSpaceEventHandler(viewer.scene.canvas);
        screenSpaceHandlers.handleClick.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
          const { latitude, longitude, elevation } = fromCartesian2(viewer, event.position);
          if (latitude != null && longitude != null && elevation != null) {
            onClick(latitude, longitude, elevation);
          }
        }, ScreenSpaceEventType.LEFT_CLICK);
      }
      return () => {
        screenSpaceHandlers.handleClick?.destroy();
        screenSpaceHandlers.handleMouseMove?.destroy();
      };
    }
  }, [viewer, onClick, onMouseMove]);
}
