import {
  CesiumWidget, Color, createWorldImageryAsync, ImageryLayer, ImageryProvider, IonImageryProvider, IonWorldImageryStyle,
  OpenStreetMapImageryProvider, Rectangle, SingleTileImageryProvider, UrlTemplateImageryProvider
} from "@cesium/engine";
import { useCallback } from "react";
import { maxLong, minLat } from "../../simulations/lava-coder/lava-constants";
import { LavaMapType } from "../../stores/ui-store";

// Self-hosted XYZ WebP pyramid built by scripts/imagery from Maxar Vivid 2020 (0.5 m) imagery provided
// by the Hawaii Statewide GIS Program. See docs/plans/2026-09-16-vivid-imagery-design.md.
const kVividTileUrl = "https://models-resources.concord.org/geocode-imagery/vivid-2020/{z}/{x}/{y}.webp";
// Zoom 17 is ~1.2 m/px, which is sharp at the camera's 1 km minimum eye height. Only the Big Island
// has tiles above zoom 14; Cesium falls back to the zoom 14 tile where a closer one is missing.
const kVividMaximumLevel = 17;
// The Big Island's imagery is the lava simulation's grid plus coastal margins, since land reaches past it
// (Keāhole Point is at -156.06); the other islands extend it west to Niʻihau and north to Kauaʻi.
// Keep in sync with IMAGERY_EXTENT and OTHER_ISLANDS_EXTENT in scripts/imagery/vivid_fetch.py.
const kVividMargin = 0.03;
const kVividRectangle = Rectangle.fromDegrees(
  -160.35, minLat - kVividMargin, maxLong + kVividMargin, 22.30
);
// Wording required by the imagery license for derivative works. The tiles' water is masked out with the
// OpenStreetMap coastline (scripts/imagery/mask_water.py), which the ODbL requires crediting.
const kVividCredit = "Includes copyrighted material of Maxar, Inc., All Rights Reserved. " +
  "Imagery via USDA-FPAC and the Hawaii Statewide GIS Program. Coastline © OpenStreetMap contributors.";
// The Vivid tiles have no water (it is masked out), so this flat color is the sea everywhere.
const kOceanColor = Color.fromBytes(15, 38, 53);

// The viewer's layer stack is [ocean, map, ...overlays].
const kMapLayerIndex = 1;

export function createOceanLayer() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = kOceanColor.toCssColorString();
    context.fillRect(0, 0, 1, 1);
  }
  return new ImageryLayer(new SingleTileImageryProvider({ url: canvas.toDataURL(), tileWidth: 1, tileHeight: 1 }));
}

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
        // Only request tiles where there is imagery; elsewhere the ocean layer shows through.
        rectangle: kVividRectangle,
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
      const oldBaseLayer = viewer.imageryLayers.get(kMapLayerIndex);
      if (oldBaseLayer) {
        viewer.imageryLayers.remove(oldBaseLayer);
      }
      // Add the new base layer just above the ocean layer
      viewer.imageryLayers.add(newBaseLayer, kMapLayerIndex);
    }
  }, [createBaseLayer]);

  return { createBaseLayer, replaceBaseLayer };
}
