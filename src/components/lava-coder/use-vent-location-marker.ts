import { Cartesian3, Cartographic, CesiumWidget, ScreenSpaceEventHandler, ScreenSpaceEventType } from "@cesium/engine";
import { useCallback, useEffect, useState } from "react";
import VentLocationMarkerIcon from "../../assets/lava-coder/location-marker.png";

const kVentLocationMarkerId = "vent-location-marker";

export function useVentLocationMarker(viewer: CesiumWidget | null, verticalExaggeration: number, onClick?: () => void) {
  const [ventLocationCartesian, setVentLocationCartesian] = useState<Cartesian3 | null>(null);

  const setVentLocation = useCallback((latitude: number, longitude: number, elevation: number) => {
    setVentLocationCartesian(Cartesian3.fromDegrees(longitude, latitude, elevation));
  }, []);

  useEffect(() => {
    if (viewer && ventLocationCartesian) {
      const cartographic = Cartographic.fromCartesian(ventLocationCartesian);
      const { latitude, longitude, height } = cartographic;
      const adjustedHeight = height * verticalExaggeration;
      const adjustedLocation = Cartesian3.fromRadians(longitude, latitude, adjustedHeight);

      // Remove previous marker if it exists
      const existing = viewer.entities.getById(kVentLocationMarkerId);
      if (existing) viewer.entities.remove(existing);

      // Add new marker
      viewer.entities.add({
        id: kVentLocationMarkerId,
        position: adjustedLocation,
        billboard: {
          image: VentLocationMarkerIcon,
          verticalOrigin: 1, // Cesium.VerticalOrigin.BOTTOM
          scale: 1.0,
        }
      });
    }

    return () => {
      if (viewer) {
        const existing = viewer.entities.getById(kVentLocationMarkerId);
        if (existing) viewer.entities.remove(existing);
      }
    };
  }, [viewer, ventLocationCartesian, verticalExaggeration]);

  useEffect(() => {
    if (!viewer) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      const pickedObject = viewer.scene.pick(event.position);
      if (pickedObject?.id && pickedObject.id.id === kVentLocationMarkerId) {
        // The vent location marker was clicked!
        onClick?.();
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [onClick, viewer]);

  const ventLocation = ventLocationCartesian ? Cartographic.fromCartesian(ventLocationCartesian) : null;
  return { ventLocation, setVentLocation };
}
