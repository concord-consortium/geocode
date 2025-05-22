import { CesiumWidget, ImageryLayer, Rectangle, SingleTileImageryProvider } from "@cesium/engine";
import { autorun } from "mobx";
import { useEffect, useRef } from "react";
import { lavaElevations, lavaSimulation } from "../../stores/lava-simulation-store";
import { maxLat, maxLong, minLat, minLong } from "./lava-constants";
import { renderMapExtent } from "./lava-options";
import { visualizeLava } from "./visualize-lava";

import ElevationDisplay from "../../assets/lava-coder/elevation-maps/elevation_from_asc_transparent_ocean.png";

let renderedExtent = false;

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

      if (renderMapExtent && !renderedExtent) {
        renderedExtent = true;
        const elevationLayer = ImageryLayer.fromProviderAsync(
          SingleTileImageryProvider.fromUrl(ElevationDisplay, {
            rectangle: Rectangle.fromDegrees(minLong, minLat, minLong + 1, minLat + 1)
          })
        );
        if (elevationLayer) {
          elevationLayer.alpha = 0.8;
          viewer?.imageryLayers.add(elevationLayer);
        }
      }

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
