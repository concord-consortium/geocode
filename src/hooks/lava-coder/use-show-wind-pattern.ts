import { Cartesian3, CesiumWidget, Entity, ImageMaterialProperty, Rectangle } from "@cesium/engine";
import { reaction } from "mobx";
import { useEffect, useRef } from "react";
import tradeWindsPng from "../../assets/lava-coder/wind-patterns/trade-winds-arrows@3x.png";
// import { tradeWindsSvg } from "../../assets/lava-coder/wind-patterns/trade-winds-svg";
// import { tradeWindsDenseSvg } from "../../assets/lava-coder/wind-patterns/trade-winds-dense-svg";
import { lavaSimulation } from "../../stores/lava-simulation-store";
// import { WindPattern } from "../../types/lava-coder/lava-coder-types";
// import { getWindData } from "../../utilities/vog-utilities";

const heightMeters = 14000;

const minLat = 18.38;
const maxLat = 20.78;
const midLat = (minLat + maxLat) / 2;
const minLon = -156.67;
const maxLon = -154.37;
const midLon = (minLon + maxLon) / 2;

export function useShowWindPattern(viewer: CesiumWidget | null) {
  const windPatternVisualizationRef = useRef<Entity | undefined>(undefined);
  useEffect(() => {
    return reaction(() => lavaSimulation.showWindPattern, (show) => {
      if (windPatternVisualizationRef.current) viewer?.entities.remove(windPatternVisualizationRef.current);

      if (show) {
        // const svg = lavaSimulation.windPattern === "trade" ? tradeWindsSvg : tradeWindsDenseSvg;
        // const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

        // const { minLat, maxLat, midLat, minLon, maxLon, midLon } =
        //   // FIXME: Why is this case needed?
        //   getWindData(lavaSimulation.windPattern as WindPattern);

        windPatternVisualizationRef.current = viewer?.entities.add({
          position: Cartesian3.fromDegrees(midLon, midLat, heightMeters),
          rectangle: {
            coordinates: Rectangle.fromDegrees(minLon, minLat, maxLon, maxLat),
            material: new ImageMaterialProperty({
              image: tradeWindsPng,
              transparent: true
            }),
            height: heightMeters,
            extrudedHeight: heightMeters, // keep it flat, not extruded
            rotation: 0, // north-up
            stRotation: 0,
          },
        });
      }
    });
  }, [viewer]);
}
