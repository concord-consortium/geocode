// This hook displays the area covered in vog painted directly on the terrain.
// TODO: Remove this hook once the final vog visualization has been determined.

import { CesiumWidget, ImageryLayer, Rectangle, SingleTileImageryProvider } from "@cesium/engine";
import { autorun, reaction } from "mobx";
import { useEffect, useRef } from "react";
import { lavaSimulation, vogBounds, vogConcentrations } from "../../stores/lava-simulation-store";
import { visualizeVog } from "./visualize-vog";

export function useVogOverlay(viewer: CesiumWidget | null) {
  const vogLayerRef = useRef<ImageryLayer | null>(null);
  // Two layers are displayed to avoid flickering. A layer is only removed when it is the third oldest.
  // This works as long as the lava always expands. If it ever contracts, this will display incorrectly.
  const oldVogLayerRef = useRef<ImageryLayer | null>(null);

  // Update the lava display
  useEffect(() => {
    return autorun(() => {
      const { voggedCells, raster } = lavaSimulation;

      if (!voggedCells || !vogConcentrations || !vogBounds || !raster || !viewer) return;

      const oldLayer = oldVogLayerRef.current;
      oldVogLayerRef.current = vogLayerRef.current;

      const url = visualizeVog(vogConcentrations);
      vogLayerRef.current = ImageryLayer.fromProviderAsync(
        SingleTileImageryProvider.fromUrl(url, {
          rectangle: Rectangle.fromDegrees(vogBounds.west, vogBounds.south, vogBounds.east, vogBounds.north)
        })
      );

      if (vogLayerRef.current) viewer.imageryLayers.add(vogLayerRef.current);
      if (oldLayer) viewer.imageryLayers.remove(oldLayer, true);
    });
  }, [viewer]);

  // Remove the old lava layers when a new simulation starts (indicated by a new worker)
  useEffect(() => {
    return reaction(
      () => lavaSimulation.vogWorker,
      () => {
        if (!viewer) return;
        if (vogLayerRef.current) viewer.imageryLayers.remove(vogLayerRef.current, true);
        if (oldVogLayerRef.current) viewer.imageryLayers.remove(oldVogLayerRef.current, true);
      }
    );
  }, [viewer]);
}
