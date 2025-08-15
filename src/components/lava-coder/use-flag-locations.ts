import { Cartesian2, Cartesian3, CesiumWidget, Color, VerticalOrigin } from "@cesium/engine";
import { autorun } from "mobx";
import { useEffect } from "react";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import { flagColorInfo, flagLabelInfo, flagLabels } from "./lava-constants";
import { useTerrainProvider } from "./use-terrain-provider";

const locationMarkerSvgText = `<svg width="23" height="33" viewBox="0 0 23 33" xmlns="http://www.w3.org/2000/svg">
    <g fill="none">
        <path d="M0 0h23v33H0z"/>
        <path d="M11.5 0C17.851 0 23 5.149 23 11.5c0 1.884-.412 3.644-1.229 5.5-.87 1.971-6.065 10.027-7.35 12.442a57.927 57.927 0 0 0-1.113 2.205c-.863 1.804-2.753 1.804-3.616 0a57.918 57.918 0 0 0-1.114-2.205l-.203-.372C6.82 26.29 2.059 18.88 1.23 17.002.412 15.146 0 13.385 0 11.5 0 5.149 5.149 0 11.5 0z" fill="#FFF"/>
        <path d="M11.5 1.5c5.523 0 10 4.477 10 10 0 6.13-5 10-9.545 19.5-.32.667-.59.667-.91 0C6.5 21.5 1.5 17.63 1.5 11.5c0-5.523 4.477-10 10-10z" fill="#000"/>
        <path d="M11.5 3a8.5 8.5 0 0 1 8.5 8.5c0 1.443-.317 2.798-.974 4.29l-.106.223c-.33.664-1.039 1.871-1.897 3.289l-3.683 6.033c-.666 1.105-1.228 2.06-1.567 2.698l-.273.521-.273-.52-.206-.38c-.493-.883-1.265-2.168-2.124-3.575l-3.055-5c-.902-1.494-1.62-2.726-1.867-3.287C3.317 14.299 3 12.943 3 11.5A8.5 8.5 0 0 1 11.5 3z" fill="replace_with_color"/>
    </g>
</svg>`;

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
        const { color, label = flagLabels[0], latitude, longitude } = flag;
        getElevation(longitude, latitude).then(pinElevation => {
          if (pinElevation >= 0) {
            const adjustedHeight = pinElevation * verticalExaggeration;
            const adjustedLocation = Cartesian3.fromDegrees(longitude, latitude, adjustedHeight);
            const locationSvg = locationMarkerSvgText
              .replace("replace_with_color", flagColorInfo[color].color ?? "#000");

            const { xOffset, yOffset } = flagLabelInfo[label] || { xOffset: 0, yOffset: 0 };
            viewer.entities.add({
              id: flagId(label),
              position: adjustedLocation,
              billboard: {
                image: `data:image/svg+xml;utf-8,${encodeURIComponent(locationSvg)}`,
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
