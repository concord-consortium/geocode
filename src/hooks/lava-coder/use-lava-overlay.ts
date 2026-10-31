import { CesiumWidget, ImageryLayer, Rectangle, SingleTileImageryProvider } from "@cesium/engine";
import { autorun, reaction } from "mobx";
import { useEffect, useRef } from "react";
import { gridBounds, lavaElevations, lavaSimulation, runFootprints } from "../../stores/lava-simulation-store";
import { visualizeLava } from "./visualize-lava";

export function useLavaOverlay(viewer: CesiumWidget | null) {
  const lavaLayerRef = useRef<ImageryLayer | null>(null);
  // Two layers are displayed to avoid flickering. A layer is only removed when it is the third oldest.
  // This works as long as the lava always expands. If it ever contracts, this will display incorrectly.
  const oldLavaLayerRef = useRef<ImageryLayer | null>(null);
  // Earlier runs, drawn in gray underneath the flow being displayed.
  const grayLayersRef = useRef<ImageryLayer[]>([]);

  // Update the lava display
  useEffect(() => {
    return autorun(() => {
      // selectedRunNumber is read so this reruns when the user picks a row in the Multirun table.
      const { coveredCells, raster, residual, selectedRunNumber } = lavaSimulation;

      if (!raster || !viewer) return;

      // A selected row displays that completed run's footprint; otherwise the live one.
      const selected = selectedRunNumber != null ? runFootprints.get(selectedRunNumber) : undefined;
      const grid = selected ? selected.grid : lavaElevations;
      const bounds = selected ? selected.bounds : gridBounds;
      const thickness = selected ? selected.residual : residual;

      if (!grid || !bounds) return;
      // The live display only has something to show once cells are covered. A stored run always does.
      if (!selected && !coveredCells) return;

      const url = visualizeLava(grid, thickness);
      const newLayer = ImageryLayer.fromProviderAsync(
        SingleTileImageryProvider.fromUrl(url, {
          rectangle: Rectangle.fromDegrees(bounds.west, bounds.south, bounds.east, bounds.north)
        })
      );

      if (selected) {
        // Switching to a stored run replaces the display outright. The two-layer cross-fade below
        // assumes the lava only ever grows, which doesn't hold when jumping between runs.
        if (lavaLayerRef.current) viewer.imageryLayers.remove(lavaLayerRef.current, true);
        if (oldLavaLayerRef.current) viewer.imageryLayers.remove(oldLavaLayerRef.current, true);
        oldLavaLayerRef.current = null;
        lavaLayerRef.current = newLayer;
        viewer.imageryLayers.add(newLayer);
        return;
      }

      const oldLayer = oldLavaLayerRef.current;
      oldLavaLayerRef.current = lavaLayerRef.current;
      lavaLayerRef.current = newLayer;

      viewer.imageryLayers.add(newLayer);
      // When the lava and vog are rendered at the same time, we might need to not destroy the old layer when removing
      // it. Destroying it can cause a crash when the user moves the camera.
      if (oldLayer) viewer.imageryLayers.remove(oldLayer, true);
    });
  }, [viewer]);

  // Draw every completed run except the one on display as gray, so the map accumulates a
  // history of where lava has gone.
  useEffect(() => {
    return autorun(() => {
      const { multirunTable, raster, selectedRunNumber } = lavaSimulation;
      // Observing `complete` reruns this when a run finishes and `selectedRunNumber` when the
      // displayed run changes. It deliberately does NOT read coveredCells, so a running
      // simulation doesn't rebuild the whole history on every frame.
      const completedRuns = multirunTable?.rows.filter(row => row.complete).map(row => row.runNumber) ?? [];

      if (!viewer) return;

      grayLayersRef.current.forEach(layer => viewer.imageryLayers.remove(layer, true));
      grayLayersRef.current = [];

      if (!raster) return;

      completedRuns
        .filter(runNumber => runNumber !== selectedRunNumber)
        .forEach(runNumber => {
          const footprint = runFootprints.get(runNumber);
          if (!footprint) return;

          if (!footprint.grayUrl) {
            footprint.grayUrl = visualizeLava(footprint.grid, footprint.residual, true);
          }
          const { bounds } = footprint;
          const layer = ImageryLayer.fromProviderAsync(
            SingleTileImageryProvider.fromUrl(footprint.grayUrl, {
              rectangle: Rectangle.fromDegrees(bounds.west, bounds.south, bounds.east, bounds.north)
            })
          );
          viewer.imageryLayers.add(layer);
          grayLayersRef.current.push(layer);
        });

      // The gray layers were just appended on top, so lift the displayed flow back above them.
      // Vog uses scene primitives rather than imagery layers, so this can't disturb it.
      if (oldLavaLayerRef.current) viewer.imageryLayers.raiseToTop(oldLavaLayerRef.current);
      if (lavaLayerRef.current) viewer.imageryLayers.raiseToTop(lavaLayerRef.current);
    });
  }, [viewer]);

  // Remove the old lava layers when a new simulation starts (indicated by a new worker)
  useEffect(() => {
    return reaction(
      () => lavaSimulation.lavaWorker,
      () => {
        if (!viewer) return;
        // Only the active flow is cleared here. The gray history is deliberately kept, so
        // earlier runs stay on the map across runs.
        if (lavaLayerRef.current) viewer.imageryLayers.remove(lavaLayerRef.current, true);
        if (oldLavaLayerRef.current) viewer.imageryLayers.remove(oldLavaLayerRef.current, true);
      }
    );
  }, [viewer]);
}
