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
  const { createBaseLayer } = useWorldImagery();
  const [baseLayer, setBaseLayer] = useState<ImageryLayer | null>(null);

  useEffect(() => {
    if (!baseLayer) {
      createBaseLayer(initialMapType).then(layer => {
        setBaseLayer(layer);
      });
    }
  }, [baseLayer, createBaseLayer, initialMapType]);

  useEffect(() => {
    if (!viewer.current && container && baseLayer && terrainProvider) {
      viewer.current = new CesiumWidget(container, {
        shouldAnimate: true,
        baseLayer,
        terrainProvider
      });
      forceRefresh(prev => !prev);
    }
    return () => {
      viewer.current?.destroy();
      viewer.current = null;
    };
  }, [baseLayer, container, terrainProvider]);

  return viewer.current;
}
