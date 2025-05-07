import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import IconButton from "../buttons/icon-button";
import RasterWorker from "./raster.worker";
import { useCesiumViewer } from "./use-cesium-viewer";

import "./lava-coder-view.css";

interface IProps {
  width: number;
  height: number;
  margin: string;
}

export const LavaCoderView = observer(function LavaCoderView({ width, height, margin }: IProps) {
  const [lavaCoderElt, setLavaCoderElt] = useState<HTMLDivElement | null>(null);
  const [showHazardZones, setShowHazardZones] = useState(false);

  const { hazardZones } = useCesiumViewer(lavaCoderElt);

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
