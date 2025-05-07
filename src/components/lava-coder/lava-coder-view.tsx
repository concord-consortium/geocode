import type { ImageryLayer } from "cesium";
import { useEffect, useRef, useState } from "react";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import { lavaElevations, lavaSimulation } from "../../stores/lava-simulation-store";
import IconButton from "../buttons/icon-button";
import RasterWorker from "./raster.worker";
import { useCesiumViewer } from "./use-cesium-viewer";
import { visualizeLava } from "./visualize-lava";

const Cesium = (window as any).Cesium;

import "./lava-coder-view.css";

interface IProps {
  width: number;
  height: number;
  margin: string;
}

export const LavaCoderView = observer(function LavaCoderView({ width, height, margin }: IProps) {
  const [lavaCoderElt, setLavaCoderElt] = useState<HTMLDivElement | null>(null);
  const [showHazardZones, setShowHazardZones] = useState(false);
  const lavaLayerRef = useRef<ImageryLayer | null>(null);
  const oldLavaLayerRef = useRef<ImageryLayer | null>(null);
  const { coveredCells, raster } = lavaSimulation;

  const { hazardZones, viewer } = useCesiumViewer(lavaCoderElt);

  // Load the elevation data
  useEffect(() => {
    if (lavaSimulation.raster) return;

    const rasterWorker = new RasterWorker();
    rasterWorker.onmessage = (e) => {
      try {
        const { status } = e.data;
        if (status === "rasterParsed") {
          lavaSimulation.setRaster(e.data.raster);
          rasterWorker.terminate();
        }
      } catch (error) {
        console.error("Error handling worker message:", error, e);
      }
    };

    rasterWorker.postMessage({ type: "start" });

    return () => {
      rasterWorker.terminate();
    };
  }, []);

  // Update the lava layer
  useEffect(() => {
    return autorun(() => {
      if (!coveredCells || !lavaElevations || !raster || !viewer) return;

      const oldLayer = oldLavaLayerRef.current;
      oldLavaLayerRef.current = lavaLayerRef.current;

      const url = visualizeLava(raster, lavaElevations);
      lavaLayerRef.current = Cesium.ImageryLayer.fromProviderAsync(
        Cesium.SingleTileImageryProvider.fromUrl(url, {
          rectangle: Cesium.Rectangle.fromDegrees(
            -155.673766,
            19.370473,
            -155.008440,
            19.819655
          )
        })
      );
      if (lavaLayerRef.current) viewer.imageryLayers.add(lavaLayerRef.current);
      if (oldLayer) viewer.imageryLayers.remove(oldLayer, true);
    });
  }, [coveredCells, raster, viewer]);

  function toggleHazardZones() {
    const newShowHazardZones = !showHazardZones;
    setShowHazardZones(newShowHazardZones);
    if (hazardZones) {
      hazardZones.show = newShowHazardZones;
    }
  }

  const containerStyle: React.CSSProperties = { width, height, margin };

  const label = showHazardZones ? "Hide Hazard Zones" : "Show Hazard Zones";

  return (
    <div className="lava-coder-view" style={containerStyle}>
      <div ref={elt => setLavaCoderElt(elt)} className="lava-coder-simulation" />
      <div className="lava-overlay-controls">
        <IconButton className="show-hazard-zones-button" label={label} onClick={() => toggleHazardZones()} />
      </div>
    </div>
  );
});
