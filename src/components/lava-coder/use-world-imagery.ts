import {
  CesiumWidget, createWorldImageryAsync, ImageryLayer, ImageryProvider, IonWorldImageryStyle,
  OpenStreetMapImageryProvider
} from "@cesium/engine";
import { useEffect } from "react";
import { LavaMapType } from "../../stores/ui-store";

export function useWorldImagery(viewer: CesiumWidget | null, type: LavaMapType) {
  useEffect(() => {
    if (viewer) {
      let imageryProviderPromise: Promise<ImageryProvider>;
      if (type === "street") {
        imageryProviderPromise = Promise.resolve(new OpenStreetMapImageryProvider({}));
      } else {
        const style: IonWorldImageryStyle = type === "terrainWithLabels"
          ? IonWorldImageryStyle.AERIAL_WITH_LABELS
          : IonWorldImageryStyle.AERIAL;
        imageryProviderPromise = createWorldImageryAsync({ style });
      }

      imageryProviderPromise.then((imageryProvider) => {
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
  }, [type, viewer]);
}
