import { Cartesian3, CesiumWidget, Entity, ImageMaterialProperty, Rectangle } from "@cesium/engine";
import { reaction } from "mobx";
import { useEffect, useRef } from "react";
import { tradeWindsSvg } from "../../assets/lava-coder/wind-patterns/trade-winds-svg";
import { konaWindsSvg } from "../../assets/lava-coder/wind-patterns/kona-winds-svg";
import { lavaSimulation } from "../../stores/lava-simulation-store";

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
        const svg = lavaSimulation.windPattern === "trade" ? tradeWindsSvg : konaWindsSvg;
        const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

        windPatternVisualizationRef.current = viewer?.entities.add({
          position: Cartesian3.fromDegrees(midLon, midLat, heightMeters),
          rectangle: {
            coordinates: Rectangle.fromDegrees(minLon, minLat, maxLon, maxLat),
            material: new ImageMaterialProperty({
              image: svgUrl,
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
