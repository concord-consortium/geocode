import { Cartesian3, CesiumWidget, Entity, ImageMaterialProperty, Rectangle } from "@cesium/engine";
import { reaction } from "mobx";
import { useEffect, useRef } from "react";
import konaWindData from "../../assets/lava-coder/wind-patterns/kona_winds.json";
import tradeWindData from "../../assets/lava-coder/wind-patterns/trade_winds.json";
import { tradeWindsSvg } from "../../assets/lava-coder/wind-patterns/trade-winds-svg";
import { tradeWindsDenseSvg } from "../../assets/lava-coder/wind-patterns/trade-winds-dense-svg";
import { lavaSimulation } from "../../stores/lava-simulation-store";

export function useShowWindPattern(viewer: CesiumWidget | null) {
  const windPatternVisualizationRef = useRef<Entity | undefined>(undefined);
  useEffect(() => {
    return reaction(() => lavaSimulation.showWindPattern, (show) => {
      if (windPatternVisualizationRef.current) viewer?.entities.remove(windPatternVisualizationRef.current);

      if (show) {
        const svg = lavaSimulation.windPattern === "trade" ? tradeWindsSvg : tradeWindsDenseSvg;
        const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        const heightMeters = 14000;

        const windData = lavaSimulation.windPattern === "trade" ? tradeWindData : konaWindData;
        const minLat = windData.lats[0];
        const maxLat = windData.lats[windData.lats.length - 1];
        const midLat = (minLat + maxLat) / 2;
        const minLon = windData.lons[0];
        const maxLon = windData.lons[windData.lons.length - 1];
        const midLon = (minLon + maxLon) / 2;

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
