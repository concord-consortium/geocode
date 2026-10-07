import { CesiumWidget, ImageryLayer, Ion, TerrainProvider } from "@cesium/engine";
import { useEffect, useRef, useState } from "react";
import { LavaMapType } from "../../stores/ui-store";
import { useWorldImagery } from "./use-world-imagery";

import "@cesium/engine/Source/Widget/CesiumWidget.css";

Ion.defaultAccessToken = process.env.CESIUM_ION_ACCESS_TOKEN;

export function useCesiumViewer(
  container: Element | null, initialMapType: LavaMapType, terrainProvider: TerrainProvider | null
) {
  const viewer = useRef<CesiumWidget | null>(null);
  const [ , forceRefresh] = useState(false);
  const { createBaseLayers } = useWorldImagery();
  const [baseLayers, setBaseLayers] = useState<ImageryLayer[] | null>(null);

  useEffect(() => {
    if (!baseLayers) {
      createBaseLayers(initialMapType).then(layers => {
        setBaseLayers(layers);
      });
    }
  }, [baseLayers, createBaseLayers, initialMapType]);

  useEffect(() => {
    if (!viewer.current && container && baseLayers?.length && terrainProvider) {
      viewer.current = new CesiumWidget(container, {
        shouldAnimate: true,
        baseLayer: baseLayers[0],
        terrainProvider
      });
      // A map type with a layer stack supplies more than one layer; the rest sit above the base
      baseLayers.slice(1).forEach((layer, index) => {
        viewer.current?.imageryLayers.add(layer, index + 1);
      });
      forceRefresh(prev => !prev);
    }
    return () => {
      viewer.current?.destroy();
      viewer.current = null;
    };
  }, [baseLayers, container, terrainProvider]);

  return viewer.current;
}
