import { CesiumWidget, ImageryLayer, Ion } from "@cesium/engine";
import { useEffect, useRef, useState } from "react";
import { LavaMapType } from "../../stores/ui-store";
import { useTerrainProvider } from "./use-terrain-provider";
import { useWorldImagery } from "./use-world-imagery";

import "@cesium/engine/Source/Widget/CesiumWidget.css";

Ion.defaultAccessToken = process.env.CESIUM_ION_ACCESS_TOKEN;

export function useCesiumViewer(container: Element | null, mapType: LavaMapType) {
  const viewer = useRef<CesiumWidget | null>(null);
  const [ , forceRefresh] = useState(false);
  const { createBaseLayer } = useWorldImagery();
  const [baseLayer, setBaseLayer] = useState<ImageryLayer | null>(null);
  const terrainProvider = useTerrainProvider();

  useEffect(() => {
    if (!baseLayer) {
      createBaseLayer(mapType).then(layer => {
        setBaseLayer(layer);
      });
    }
  }, [baseLayer, createBaseLayer, mapType]);

  useEffect(() => {
    if (!viewer.current && container && baseLayer && terrainProvider) {
      viewer.current = new CesiumWidget(container, {
        shouldAnimate: true,
        baseLayer,
        terrainProvider
      });
      forceRefresh(prev => !prev);
    }
    return () => viewer.current?.destroy();
  }, [baseLayer, container, terrainProvider]);

  return viewer.current;
}
