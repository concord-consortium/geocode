import { Cartesian3, CesiumWidget, ScreenSpaceEventHandler, ScreenSpaceEventType } from "@cesium/engine";
import { useEffect } from "react";
import VentLocationMarkerIcon from "../../assets/lava-coder/location-marker.png";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import { useTerrainProvider } from "./use-terrain-provider";

const kVentLocationMarkerId = "vent-location-marker";

interface IProps {
  viewer: CesiumWidget | null;
  verticalExaggeration: number;
  hide?: boolean;
  onClick?: () => void;
}

export function useVentLocationMarker({ viewer, verticalExaggeration, hide, onClick }: IProps) {
  const { showPin, pinLatitude, pinLongitude, pinElevation } = lavaSimulation;
  const { getElevation, terrainProvider } = useTerrainProvider();

  useEffect(() => {
    if (terrainProvider && pinElevation < 0) {
      getElevation(pinLongitude, pinLatitude).then(elevation => {
        lavaSimulation.setPinElevation(elevation);
      }).catch(error => {
        console.error("Error fetching elevation:", error);
      });
    }
  }, [getElevation, terrainProvider, pinElevation, pinLatitude, pinLongitude]);

  useEffect(() => {
    if (viewer && pinLatitude != null && pinLongitude != null && pinElevation >= 0) {
      const adjustedHeight = pinElevation * verticalExaggeration;
      const adjustedLocation = Cartesian3.fromDegrees(pinLongitude, pinLatitude, adjustedHeight);

      // Remove previous marker if it exists
      const existing = viewer.entities.getById(kVentLocationMarkerId);
      if (existing) viewer.entities.remove(existing);

      // Add new marker
      if (showPin) {
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
    }

    return () => {
      if (viewer) {
        const existing = viewer.entities.getById(kVentLocationMarkerId);
        if (existing) viewer.entities.remove(existing);
      }
    };
  }, [showPin, pinElevation, pinLatitude, pinLongitude, verticalExaggeration, viewer]);

  useEffect(() => {
    if (viewer) {
      const marker = viewer.entities.getById(kVentLocationMarkerId);
      if (marker) marker.show = !hide;
    }
  });

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
}
