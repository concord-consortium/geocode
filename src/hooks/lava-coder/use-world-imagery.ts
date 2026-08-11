import {
  CesiumWidget, createWorldImageryAsync, ImageryLayer, ImageryProvider, IonImageryProvider, IonWorldImageryStyle,
  OpenStreetMapImageryProvider, UrlTemplateImageryProvider
} from "@cesium/engine";
import { useCallback } from "react";
import { LavaMapType } from "../../stores/ui-store";

const imageryProviders: Partial<Record<LavaMapType, Promise<ImageryProvider>>> = {};

function getImageryProvider(type: LavaMapType): Promise<ImageryProvider> {
  if (!imageryProviders[type]) {
    if (type === "develop") {
      // Use lower-resolution imagery for development
      const SENTINEL_2_IMAGERY_ASSET_ID = 3954;
      imageryProviders[type] = IonImageryProvider.fromAssetId(SENTINEL_2_IMAGERY_ASSET_ID);
    }
    else if (type === "street") {
      imageryProviders[type] = Promise.resolve(new OpenStreetMapImageryProvider({}));
    }
    else if (type === "esri") {
      // Experimental: Esri World Imagery, accessed keyless the same way the Leaflet units access
      // World_Topo_Map. Serves past level 19, well beyond the ~17 this app can reach.
      // NOTE: keyless access is ToS-gray -- a production version needs an API key.
      imageryProviders[type] = Promise.resolve(new UrlTemplateImageryProvider({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        maximumLevel: 19,
        credit: "Esri, Maxar, Earthstar Geographics, and the GIS User Community"
      }));
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
