import {
  CesiumWidget, createWorldImageryAsync, ImageryLayer, ImageryProvider, IonImageryProvider, IonWorldImageryStyle,
  OpenStreetMapImageryProvider
} from "@cesium/engine";
import { useCallback } from "react";
import { LavaMapType } from "../../stores/ui-store";

const imageryProviders: Partial<Record<LavaMapType, Promise<ImageryProvider>>> = {};

function getImageryProvider(type: LavaMapType): Promise<ImageryProvider> {
  if (!imageryProviders[type]) {
    if (type === "develop") {
      // Use lower-resolution imagery for development.
      // Cesium has retired this Ion asset — it now 404s, and because the rejection was never
      // handled it surfaced as an uncaught error that the dev-server overlay threw over the
      // whole app. "develop" is the default map type in development (see ui-store), so this
      // blocked local work entirely. Fall back to the standard world imagery instead, and
      // start using the asset again by itself if Cesium ever restores it.
      const SENTINEL_2_IMAGERY_ASSET_ID = 3954;
      imageryProviders[type] = IonImageryProvider.fromAssetId(SENTINEL_2_IMAGERY_ASSET_ID)
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.warn("Low-resolution development imagery is unavailable, using world imagery.", error);
          return createWorldImageryAsync({ style: IonWorldImageryStyle.AERIAL });
        });
    }
    else if (type === "street") {
      imageryProviders[type] = Promise.resolve(new OpenStreetMapImageryProvider({}));
    }
    else {
      // Bing maps is the default imagery provider in Cesium
      const style: IonWorldImageryStyle = type === "terrainWithLabels"
        ? IonWorldImageryStyle.AERIAL_WITH_LABELS
        : IonWorldImageryStyle.AERIAL;
      imageryProviders[type] = createWorldImageryAsync({ style });
    }
  }
  return imageryProviders[type];
}

export function useWorldImagery() {

  const createBaseLayer = useCallback(async (mapType: LavaMapType) => {
    const imageryProvider = await getImageryProvider(mapType);
    return new ImageryLayer(imageryProvider);
  }, []);

  const replaceBaseLayer = useCallback(async (viewer: CesiumWidget | null, mapType: LavaMapType) => {
    if (!viewer) return;

    const newBaseLayer = await createBaseLayer(mapType);
    if (newBaseLayer) {
      // Remove the old base layer
      const oldBaseLayer = viewer.imageryLayers.get(0);
      if (oldBaseLayer) {
        viewer.imageryLayers.remove(oldBaseLayer);
      }
      // Add the new base layer at the bottom of the layer stack
      viewer.imageryLayers.add(newBaseLayer, 0);
    }
  }, [createBaseLayer]);

  return { createBaseLayer, replaceBaseLayer };
}
