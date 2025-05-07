import { useState } from "react";
import IconButton from "../buttons/icon-button";
import { useCesiumViewer } from "./use-cesium-viewer";

import "./lava-coder-view.css";

interface IProps {
  width: number;
  height: number;
  margin: string;
}

export function LavaCoderView({ width, height, margin }: IProps) {
  const [lavaCoderElt, setLavaCoderElt] = useState<HTMLDivElement | null>(null);
  const [showHazardZones, setShowHazardZones] = useState(false);

  const { hazardZones } = useCesiumViewer(lavaCoderElt);

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
}
