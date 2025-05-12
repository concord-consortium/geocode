import { CesiumWidget } from "@cesium/engine";
import { useEffect, useState } from "react";

const kNormalElevation = 1;
// The vertical exaggeration factor for the terrain. This is used to make the terrain more visually distinct.
const kVerticalExaggeration = 3;

export function useVerticalExaggeration(viewer: CesiumWidget | null) {
  const [verticalExaggeration, setVerticalExaggeration] = useState(kNormalElevation);

  function toggleVerticalExaggeration() {
    setVerticalExaggeration(prev => prev === kNormalElevation ? kVerticalExaggeration : kNormalElevation);
  }

  useEffect(() => {
    if (viewer) {
      viewer.scene.verticalExaggeration = verticalExaggeration;
    }
  }, [verticalExaggeration, viewer]);

  return { toggleVerticalExaggeration, verticalExaggeration };
}
