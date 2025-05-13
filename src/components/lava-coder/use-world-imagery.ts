import {
  CesiumWidget, createWorldImageryAsync, ImageryLayer, IonWorldImageryStyle, OpenStreetMapImageryProvider
} from "@cesium/engine";
import { useEffect } from "react";

export type BaseLayerType = "aerial" | "aerialWithLabels" | "osm";

export function useWorldImagery(viewer: CesiumWidget | null, type: BaseLayerType) {
  useEffect(() => {
    if (viewer) {
      let imageryProviderPromise: Promise<any>;
      if (type === "osm") {
        imageryProviderPromise = Promise.resolve(new OpenStreetMapImageryProvider({}));
      } else {
        const style: IonWorldImageryStyle = type === "aerialWithLabels"
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
