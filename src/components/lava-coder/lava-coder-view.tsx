
import { useState } from "react";
import IconButton from "../buttons/icon-button";
import { useCesiumClickEvent } from "./use-cesium-click-event";
import { useCesiumViewer } from "./use-cesium-viewer";
import { useElevationData } from "./use-elevation-data";
import { useHazardZones } from "./use-hazard-zones";
import { useLavaOverlay } from "./use-lava-overlay";
import { kNormalElevation, kVerticalExaggeration, useVerticalExaggeration } from "./use-vertical-exaggeration";
import { useWorldImagery } from "./use-world-imagery";

import "./lava-coder-view.scss";

interface IProps {
  width: number;
  height: number;
  margin: string;
}

const round6 = (value: number) => Math.round(value * 1000000) / 1000000;

export function LavaCoderView({ width, height, margin }: IProps) {
  const [lavaCoderElt, setLavaCoderElt] = useState<HTMLDivElement | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const [showHazardZones, setShowHazardZones] = useState(false);

  const viewer = useCesiumViewer(lavaCoderElt);

  useWorldImagery(viewer, showLabels);

  const { toggleVerticalExaggeration, verticalExaggeration } = useVerticalExaggeration(viewer);

  useHazardZones(viewer, showHazardZones, verticalExaggeration);

  useElevationData();

  useLavaOverlay(viewer);

  useCesiumClickEvent(viewer, (latitude, longitude, elevation) => {
    const kFeetPerMeter = 3.28084;
    const elevationFeet = Math.round(elevation * kFeetPerMeter);
    // eslint-disable-next-line no-console
    console.log("Clicked at latitude:", round6(latitude), "longitude:", round6(longitude),
                "elevation:", `${Math.round(elevation)}m = ${elevationFeet}ft`);
  });

  function toggleShowLabels() {
    setShowLabels(prev => !prev);
  }

  function toggleHazardZones() {
    setShowHazardZones(prev => !prev);
  }

  const containerStyle: React.CSSProperties = { width, height, margin };

  const showLabelsLabel = showLabels ? "Hide Labels" : "Show Labels";
  const hazardZonesLabel = showHazardZones ? "Hide Hazard Zones" : "Show Hazard Zones";
  const exaggerateLabel = verticalExaggeration === kNormalElevation
                            ? `Exaggerate Elevation (${kVerticalExaggeration}x)`
                            : `Normal Elevation (${kNormalElevation}x)`;

  return (
    <div className="lava-coder-view" style={containerStyle}>
      <div ref={elt => setLavaCoderElt(elt)} className="lava-coder-simulation" />
      <div className="lava-overlay-controls">
        <IconButton className="show-labels-button" label={showLabelsLabel} onClick={() => toggleShowLabels()} />
        <IconButton className="show-hazard-zones-button" label={hazardZonesLabel} onClick={() => toggleHazardZones()} />
        <IconButton className="exaggerate-elevation-button" label={exaggerateLabel} onClick={() => toggleVerticalExaggeration()} />
      </div>
    </div>
  );
}
