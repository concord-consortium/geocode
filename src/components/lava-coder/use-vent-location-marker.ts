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
  const { isDefaultVentLocation, ventLatitude, ventLongitude, ventElevation } = lavaSimulation;
  const { getElevation, terrainProvider } = useTerrainProvider();

  useEffect(() => {
    if (terrainProvider && ventElevation < 0) {
      getElevation(ventLongitude, ventLatitude).then(elevation => {
        lavaSimulation.setVentElevation(elevation);
      }).catch(error => {
        console.error("Error fetching elevation:", error);
      });
    }
  }, [getElevation, terrainProvider, ventElevation, ventLatitude, ventLongitude]);

  useEffect(() => {
    if (viewer && ventLatitude != null && ventLongitude != null && ventElevation >= 0) {
      const adjustedHeight = ventElevation * verticalExaggeration;
      const adjustedLocation = Cartesian3.fromDegrees(ventLongitude, ventLatitude, adjustedHeight);

      // Remove previous marker if it exists
      const existing = viewer.entities.getById(kVentLocationMarkerId);
      if (existing) viewer.entities.remove(existing);

      // Add new marker
      if (!isDefaultVentLocation) {
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
  }, [isDefaultVentLocation, ventElevation, ventLatitude, ventLongitude, verticalExaggeration, viewer]);

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
