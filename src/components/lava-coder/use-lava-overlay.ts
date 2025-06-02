import { CesiumWidget, ImageryLayer, Rectangle, SingleTileImageryProvider } from "@cesium/engine";
import { autorun, reaction } from "mobx";
import { useEffect, useRef } from "react";
import { gridBounds, lavaElevations, lavaSimulation } from "../../stores/lava-simulation-store";
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

      if (!coveredCells || !lavaElevations || !gridBounds || !raster || !viewer) return;

      const oldLayer = oldLavaLayerRef.current;
      oldLavaLayerRef.current = lavaLayerRef.current;

      const url = visualizeLava(lavaElevations);
      lavaLayerRef.current = ImageryLayer.fromProviderAsync(
        SingleTileImageryProvider.fromUrl(url, {
          rectangle: Rectangle.fromDegrees(gridBounds.west, gridBounds.south, gridBounds.east, gridBounds.north)
        })
      );

      if (lavaLayerRef.current) viewer.imageryLayers.add(lavaLayerRef.current);
      if (oldLayer) viewer.imageryLayers.remove(oldLayer, true);
    });
  }, [viewer]);

  // Remove the old lava layers when a new simulation starts (indicated by a new worker)
  useEffect(() => {
    return reaction(
      () => lavaSimulation.worker,
      () => {
        if (!viewer) return;
        if (lavaLayerRef.current) viewer.imageryLayers.remove(lavaLayerRef.current, true);
        if (oldLavaLayerRef.current) viewer.imageryLayers.remove(oldLavaLayerRef.current, true);
      }
    );
  }, [viewer]);
}
