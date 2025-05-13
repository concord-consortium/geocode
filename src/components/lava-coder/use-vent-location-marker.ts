import { Cartesian3, Cartographic, CesiumWidget } from "@cesium/engine";
import { useCallback, useEffect, useState } from "react";
import ventLocationMarkerIcon from "../../assets/lava-coder/location-marker.png";

const kVentLocationMarkerId = "vent-location-marker";

export function useVentLocationMarker(viewer: CesiumWidget | null) {
  const [ventLocationCartesian, setVentLocationCartesian] = useState<Cartesian3 | null>(null);

  const setVentLocation = useCallback((latitude: number, longitude: number, elevation: number) => {
    setVentLocationCartesian(Cartesian3.fromDegrees(longitude, latitude, elevation));
  }, []);

  useEffect(() => {
    if (viewer && ventLocationCartesian) {
      // Remove previous marker if it exists
      const existing = viewer.entities.getById(kVentLocationMarkerId);
      if (existing) viewer.entities.remove(existing);

      // Add new marker
      viewer.entities.add({
        id: kVentLocationMarkerId,
        position: ventLocationCartesian,
        billboard: {
          image: ventLocationMarkerIcon,
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
  }, [viewer, ventLocationCartesian]);

  const ventLocation = ventLocationCartesian ? Cartographic.fromCartesian(ventLocationCartesian) : null;
  return { ventLocation, setVentLocation };
}
