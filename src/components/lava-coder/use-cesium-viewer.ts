import { Cartesian3, CesiumWidget, Math as CSMath, Ion } from "@cesium/engine";
import { useEffect, useRef, useState } from "react";
import { useTerrainProvider } from "./use-terrain-provider";

import "@cesium/engine/Source/Widget/CesiumWidget.css";

Ion.defaultAccessToken = process.env.CESIUM_ION_ACCESS_TOKEN;

const kDefaultXLng = -155.470;
const kDefaultYLat = 19.150;
const kDefaultZHeight = 132000;

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

      // Fly the camera to Hawaii at the given longitude, latitude, and height.
      viewer.current.camera.flyTo({
        destination: Cartesian3.fromDegrees(kDefaultXLng, kDefaultYLat, kDefaultZHeight),
        orientation: {
          heading: CSMath.toRadians(0.0),
          pitch: CSMath.toRadians(-75.0),
        },
        // move instantaneously to the destination
        easingFunction: () => 1
      });
    }
    return () => viewer.current?.destroy();
  }, [container, terrainProvider]);

  return viewer.current;
}
