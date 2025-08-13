import { Cartesian3, CesiumWidget } from "@cesium/engine";
import { autorun } from "mobx";
import { useEffect } from "react";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import { flagLabels } from "./lava-constants";
import { useTerrainProvider } from "./use-terrain-provider";

import LocationMarker from "../../assets/lava-coder/location-marker.png";

function flagId(label: string) {
  return `flag-${label}`;
}

interface IUseFlagLocationsProps {
  verticalExaggeration: number;
  viewer: CesiumWidget | null;
}
export function useFlagLocations({ verticalExaggeration, viewer }: IUseFlagLocationsProps) {
  const { getElevation } = useTerrainProvider();

  useEffect(() => {
    return autorun(() => {
      if (!viewer) return;

      const { flagLocations } = lavaSimulation;

      // Remove existing flags from the map
      flagLabels.forEach(label => {
        const existingFlag = viewer.entities.getById(flagId(label));
        if (existingFlag) {
          viewer.entities.remove(existingFlag);
        }
      });

      // Add flags to the map
      flagLocations.forEach(flag => {
        const { label = flagLabels[0], latitude, longitude } = flag;
        getElevation(longitude, latitude).then(pinElevation => {
          if (pinElevation >= 0) {
            const adjustedHeight = pinElevation * verticalExaggeration;
            const adjustedLocation = Cartesian3.fromDegrees(longitude, latitude, adjustedHeight);

            viewer.entities.add({
              id: flagId(label),
              position: adjustedLocation,
              billboard: {
                image: LocationMarker,
                verticalOrigin: 1, // Cesium.VerticalOrigin.BOTTOM
                scale: 1.0,
              // },
              // label: {
              //   text: label,
              //   font: "14px sans-serif",
              //   fillColor: Cesium.Color.WHITE,
              //   outlineColor: Cesium.Color.BLACK,
              //   outlineWidth: 2,
              //   pixelOffset: new Cartesian2(0, -20), // Adjust as needed
              }
            });
          }
        });
      });
    });
  }, [getElevation, verticalExaggeration, viewer]);
}
