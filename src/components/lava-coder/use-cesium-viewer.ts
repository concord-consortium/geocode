import { CesiumWidget, Ion } from "@cesium/engine";
import { useEffect, useRef, useState } from "react";
import { useTerrainProvider } from "./use-terrain-provider";

import "@cesium/engine/Source/Widget/CesiumWidget.css";

Ion.defaultAccessToken = process.env.CESIUM_ION_ACCESS_TOKEN;

export function useCesiumViewer(container: Element | null) {
  const viewer = useRef<CesiumWidget | null>(null);
  const [ , forceRefresh] = useState(false);
  const terrainProvider = useTerrainProvider();

  useEffect(() => {
    if (container && terrainProvider && !viewer.current) {
      viewer.current = new CesiumWidget(container, {
        shouldAnimate: true,
        terrainProvider
      });
      forceRefresh(prev => !prev);
    }
    return () => viewer.current?.destroy();
  }, [container, terrainProvider]);

  return viewer.current;
}
