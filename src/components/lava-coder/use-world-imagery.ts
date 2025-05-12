import { CesiumWidget, createWorldImageryAsync, ImageryLayer, IonWorldImageryStyle } from "@cesium/engine";
import { useEffect } from "react";

export function useWorldImagery(viewer: CesiumWidget | null, showLabels: boolean) {
  useEffect(() => {
    if (viewer) {
      const style: IonWorldImageryStyle = showLabels
        ? IonWorldImageryStyle.AERIAL_WITH_LABELS
        : IonWorldImageryStyle.AERIAL;
      createWorldImageryAsync({ style }).then((imageryProvider) => {
        // Remove the old base layer
        const oldBaseLayer = viewer.imageryLayers.get(0);
        if (oldBaseLayer) {
          viewer.imageryLayers.remove(oldBaseLayer);
        }
        const newBaseLayer = new ImageryLayer(imageryProvider);
        // Add the new base layer at the bottom of the layer stack
        viewer.imageryLayers.add(newBaseLayer, 0);
      });
    }
  }, [showLabels, viewer]);
}
