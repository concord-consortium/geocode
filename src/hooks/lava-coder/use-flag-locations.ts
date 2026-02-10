import { Cartesian2, Cartesian3, CesiumWidget, Color, VerticalOrigin } from "@cesium/engine";
import { autorun } from "mobx";
import { useEffect } from "react";
import { getLocationMarkerSvg } from "../../components/lava-coder/location-markers";
import { flagColorInfo, flagLabelInfo, flagLabels } from "../../simulations/lava-coder/lava-constants";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import { useTerrainProvider } from "./use-terrain-provider";

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
        // let existingFlag: Entity | undefined;
        // try {
        //   existingFlag = viewer.entities.getById(flagId(label));
        // } catch {
        //   // Entities access can throw during Cesium widget initialization/destruction
        // }
        if (existingFlag) {
          viewer.entities.remove(existingFlag);
        }
      });

      // Add flags to the map
      flagLocations.forEach(flag => {
        const { color, label = flagLabels[0], latitude, longitude } = flag;
        getElevation(longitude, latitude).then(pinElevation => {
          if (pinElevation >= 0) {
            const adjustedHeight = pinElevation * verticalExaggeration;
            const adjustedLocation = Cartesian3.fromDegrees(longitude, latitude, adjustedHeight);

            const { xOffset, yOffset } = flagLabelInfo[label] || { xOffset: 0, yOffset: 0 };
            viewer.entities.add({
              id: flagId(label),
              position: adjustedLocation,
              billboard: {
                image: getLocationMarkerSvg(flagColorInfo[color].color ?? "#000"),
                scale: 1.0,
                verticalOrigin: VerticalOrigin.BOTTOM,
              },
              label: {
                eyeOffset: new Cartesian3(0, 0, -1),
                fillColor: Color.BLACK,
                font: "14px Lato-Bold, Lato, sans-serif",
                pixelOffset: new Cartesian2(xOffset, yOffset),
                text: label,
              }
            });
          }
        });
      });
    });
  }, [getElevation, verticalExaggeration, viewer]);
}
