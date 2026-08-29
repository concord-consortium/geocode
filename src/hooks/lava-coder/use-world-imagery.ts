import {
  CesiumWidget, createWorldImageryAsync, ImageryLayer, ImageryProvider, IonImageryProvider, IonWorldImageryStyle,
  OpenStreetMapImageryProvider, UrlTemplateImageryProvider
} from "@cesium/engine";
import { useCallback } from "react";
import { LavaMapType } from "../../stores/ui-store";

// Imagery keys are map types plus any layers that only ever appear as part of a stack
type ImageryKey = LavaMapType | "cartoLabels" | "esriLabels";

const imageryProviders: Partial<Record<ImageryKey, Promise<ImageryProvider>>> = {};

function getImageryProvider(type: ImageryKey): Promise<ImageryProvider> {
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
    else if (type === "usgs") {
      // Experimental: free, public-domain orthoimagery from USGS The National Map.
      // The tile cache 404s above level 16 over Hawaii, so maximumLevel must be set or Cesium
      // requests tiles that do not exist and leaves holes in the globe.
      imageryProviders[type] = Promise.resolve(new UrlTemplateImageryProvider({
        url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
        maximumLevel: 16,
        credit: "USGS The National Map: Orthoimagery"
      }));
    }
    else if (type === "hawaii") {
      // Experimental: WorldView-2 2016 orthoimagery from the Hawaii Statewide GIS Program.
      // Standard Web Mercator tiling scheme, cached to level 19 (0.3 m/px).
      // NOTE: these are PNG tiles averaging ~125 KB, roughly 10x the size of Esri's JPEGs.
      imageryProviders[type] = Promise.resolve(new UrlTemplateImageryProvider({
        url: "https://geodata.hawaii.gov/arcgis/rest/services/SoH_Imagery/WV2_2016/MapServer" +
             "/tile/{z}/{y}/{x}",
        maximumLevel: 19,
        credit: "State of Hawaii Statewide GIS Program"
      }));
    }
    else if (type === "vivid") {
      // Experimental: Maxar Vivid 2022 (0.5 m) from the Hawaii Statewide GIS Program.
      //
      // This is an ImageServer with no tile cache, so there is no /tile/{z}/{y}/{x} path. Instead we
      // drive its exportImage endpoint through Cesium's projected-bbox placeholders, which makes a
      // dynamic image service usable as an imagery layer with no custom provider.
      //
      // EVALUATION ONLY: every tile is rendered on demand by the state's server, so this is slower
      // than a cache and puts real load on a public service. It is here to judge image quality, not
      // to ship. A production version would bake static tiles from this source.
      // Using the 2020 mosaic rather than 2022: the 2022 one has nodata gaps, including a ~800 m
      // band clear across the island near 19.554,-155.713. Measured over the app's AOI, 2020 has
      // zero interior holes and 4% more coverage, at 0.5 m vs 0.6 m.
      imageryProviders[type] = Promise.resolve(new UrlTemplateImageryProvider({
        url: "https://geodata.hawaii.gov/arcgis/rest/services/SoH_Imagery/Vivid_2020/ImageServer" +
             "/exportImage?bbox={westProjected},{southProjected},{eastProjected},{northProjected}" +
             "&bboxSR=3857&imageSR=3857&size={width},{height}&format=jpg&f=image",
        maximumLevel: 19,
        credit: "Maxar Vivid 2020 via State of Hawaii Statewide GIS Program"
      }));
    }
    else if (type === "cartoLabels") {
      // Transparent place-name overlay, drawn above imagery rather than as a base layer. OSM-derived
      // and free for non-commercial use with attribution. The "dark" variant is light text, which
      // reads better over lava than the dark text of the "light" variant.
      imageryProviders[type] = Promise.resolve(new UrlTemplateImageryProvider({
        url: "https://basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png",
        maximumLevel: 19,
        credit: "© OpenStreetMap contributors © CARTO"
      }));
    }
    else if (type === "esriLabels") {
      // Esri's reference overlay, the layer they pair with World Imagery. Sparser than the CARTO
      // labels (0.3% vs 0.8% ink) and already styled for imagery: pale text on a strong black halo.
      // World_Reference_Overlay is the same idea but adds road casings -- far too busy here.
      // NOTE: keyless access is ToS-gray, same as the Esri imagery above.
      imageryProviders[type] = Promise.resolve(new UrlTemplateImageryProvider({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference" +
             "/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        maximumLevel: 19,
        credit: "Esri, Garmin, and the GIS User Community"
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

// Map types that render as a stack of layers, ordered bottom to top. Any map type not listed here
// renders as a single layer of the same name.
const kLayerStack: Partial<Record<LavaMapType, ImageryKey[]>> = {
  vividWithLabels: ["vivid", "cartoLabels"],
  vividWithEsriLabels: ["vivid", "esriLabels"]
};

// Per-layer display adjustments, applied by Cesium in the shader as the layer is drawn.
// CARTO's label tiles are grey text on a dark halo rather than white on black, so brightness lifts
// the text to white while contrast pushes the halo darker, keeping the two separated over both
// bright vegetation and black lava. Saturation removes any residual colour cast.
const kLayerOptions: Partial<Record<ImageryKey, ImageryLayer.ConstructorOptions>> = {
  cartoLabels: { brightness: 1.75, contrast: 1.4, saturation: 0 },
  esriLabels: { brightness: 1.65, saturation: 0 }
};

// The layers currently installed at the bottom of the viewer's layer stack. Tracked so a map type
// change can remove exactly those, leaving the lava and vog overlays added above them untouched.
let currentBaseLayers: ImageryLayer[] = [];

export function useWorldImagery() {

  // Returns the layers for a map type, ordered bottom to top.
  const createBaseLayers = useCallback(async (mapType: LavaMapType) => {
    const keys = kLayerStack[mapType] ?? [mapType];
    const providers = await Promise.all(keys.map(getImageryProvider));
    currentBaseLayers = providers.map((provider, index) => new ImageryLayer(provider, kLayerOptions[keys[index]]));
    return currentBaseLayers;
  }, []);

  const replaceBaseLayer = useCallback(async (viewer: CesiumWidget | null, mapType: LavaMapType) => {
    if (!viewer) return;

    // Capture the outgoing layers before createBaseLayers() reassigns currentBaseLayers
    const oldBaseLayers = currentBaseLayers;
    const newBaseLayers = await createBaseLayers(mapType);

    oldBaseLayers.forEach(layer => {
      if (viewer.imageryLayers.contains(layer)) {
        viewer.imageryLayers.remove(layer);
      }
    });
    newBaseLayers.forEach((layer, index) => viewer.imageryLayers.add(layer, index));
  }, [createBaseLayers]);

  return { createBaseLayers, replaceBaseLayer };
}
