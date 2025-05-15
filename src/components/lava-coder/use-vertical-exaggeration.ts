import { CesiumWidget } from "@cesium/engine";
import { useEffect } from "react";

// The vertical exaggeration factor for the terrain. This is used to make the terrain more visually distinct.
export function useVerticalExaggeration(viewer: CesiumWidget | null, verticalExaggeration = 1) {

  useEffect(() => {
    if (viewer) {
      viewer.scene.verticalExaggeration = verticalExaggeration;
    }
  }, [verticalExaggeration, viewer]);
}
