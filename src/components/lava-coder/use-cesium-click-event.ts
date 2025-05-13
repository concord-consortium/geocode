import {
  Cartographic, CesiumWidget, Math as CSMath, ScreenSpaceEventHandler, ScreenSpaceEventType
} from "@cesium/engine";
import { useEffect } from "react";

type CartographicEventCallback = (latitude: number, longitude: number, elevation: number) => void;

export function useCesiumClickEvent(viewer: CesiumWidget | null, onClick: CartographicEventCallback) {
  useEffect(() => {
    if (viewer) {
      const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
        const windowPosition = event.position;
        if (windowPosition) {
          const cartesian = viewer.scene.pickPosition(windowPosition);
          if (cartesian) {
            const cartographic = Cartographic.fromCartesian(cartesian);
            const latitude = CSMath.toDegrees(cartographic.latitude);
            const longitude = CSMath.toDegrees(cartographic.longitude);
            const elevation = cartographic.height;
            onClick(latitude, longitude, elevation);
          }
        }
      }, ScreenSpaceEventType.LEFT_CLICK);
      return () => handler.destroy();
    }
  }, [viewer, onClick]);
}
