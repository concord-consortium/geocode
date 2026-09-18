import {
  CesiumWidget, createWorldImageryAsync, ImageryLayer, ImageryProvider, IonImageryProvider, IonWorldImageryStyle,
  OpenStreetMapImageryProvider, Rectangle, UrlTemplateImageryProvider
} from "@cesium/engine";
import { useCallback } from "react";
import { maxLat, maxLong, minLat, minLong } from "../../simulations/lava-coder/lava-constants";
import { LavaMapType } from "../../stores/ui-store";

// Self-hosted XYZ WebP pyramid built by scripts/imagery from Maxar Vivid 2020 (0.5 m) imagery provided
// by the Hawaii Statewide GIS Program. See docs/plans/2026-09-16-vivid-imagery-design.md.
const kVividTileUrl = "https://models-resources.concord.org/geocode-imagery/vivid-2020/{z}/{x}/{y}.webp";
// Zoom 17 is ~1.2 m/px, which is sharp at the camera's 1 km minimum eye height.
const kVividMaximumLevel = 17;
// Wording required by the imagery license for derivative works
const kVividCredit = "Includes copyrighted material of Maxar, Inc., All Rights Reserved. " +
  "Imagery via USDA-FPAC and the Hawaii Statewide GIS Program.";

const imageryProviders: Partial<Record<LavaMapType, Promise<ImageryProvider>>> = {};

function getImageryProvider(type: LavaMapType): Promise<ImageryProvider> {
  if (!imageryProviders[type]) {
    if (type === "develop") {
      // Use lower-resolution imagery for development
      const SENTINEL_2_IMAGERY_ASSET_ID = 3954;
      imageryProviders[type] = IonImageryProvider.fromAssetId(SENTINEL_2_IMAGERY_ASSET_ID);
    }
    else if (type === "vivid") {
      imageryProviders[type] = Promise.resolve(new UrlTemplateImageryProvider({
        url: kVividTileUrl,
        // Only request tiles over the area the camera can reach; elsewhere the globe shows its base color.
        rectangle: Rectangle.fromDegrees(minLong, minLat, maxLong, maxLat),
        maximumLevel: kVividMaximumLevel,
        credit: kVividCredit
      }));
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
