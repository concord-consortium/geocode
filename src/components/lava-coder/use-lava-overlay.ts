import { CesiumWidget, ImageryLayer, Rectangle, SingleTileImageryProvider } from "@cesium/engine";
import { autorun } from "mobx";
import { useEffect, useRef } from "react";
import { lavaElevations, lavaSimulation } from "../../stores/lava-simulation-store";
import { maxLat, maxLong, minLat, minLong } from "./lava-constants";
import { visualizeLava } from "./visualize-lava";

export function useLavaOverlay(viewer: CesiumWidget | null) {
  const lavaLayerRef = useRef<ImageryLayer | null>(null);
  // Two layers are displayed to avoid flickering. A layer is only removed when it is the third oldest.
  // This works as long as the lava always expands. If it ever contracts, this will display incorrectly.
  const oldLavaLayerRef = useRef<ImageryLayer | null>(null);

  // Update the lava display
  useEffect(() => {
    return autorun(() => {
      const { coveredCells, raster } = lavaSimulation;

      if (!coveredCells || !lavaElevations || !raster || !viewer) return;

      const oldLayer = oldLavaLayerRef.current;
      oldLavaLayerRef.current = lavaLayerRef.current;

      const url = visualizeLava(raster, lavaElevations);
      lavaLayerRef.current = ImageryLayer.fromProviderAsync(
        SingleTileImageryProvider.fromUrl(url, {
          rectangle: Rectangle.fromDegrees(minLong, minLat, maxLong, maxLat)
        })
      );
      if (lavaLayerRef.current) viewer.imageryLayers.add(lavaLayerRef.current);
      if (oldLayer) viewer.imageryLayers.remove(oldLayer, true);
    });
  }, [viewer]);
}
