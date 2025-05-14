
import { useState } from "react";
import MapStreetIcon from "../../assets/lava-coder/map-street-icon.png";
import MapTerrainIcon from "../../assets/lava-coder/map-terrain-icon.png";
import IconButton from "../buttons/icon-button";
import { useCesiumClickEvent } from "./use-cesium-click-event";
import { useCesiumViewer } from "./use-cesium-viewer";
import { useElevationData } from "./use-elevation-data";
import { useHazardZones } from "./use-hazard-zones";
import { useLavaOverlay } from "./use-lava-overlay";
import { kNormalElevation, useVerticalExaggeration } from "./use-vertical-exaggeration";
import { BaseLayerType, useWorldImagery } from "./use-world-imagery";

import "./lava-coder-view.scss";

interface IProps {
  width: number;
  height: number;
  margin: string;
}

const round6 = (value: number) => Math.round(value * 1000000) / 1000000;

export function LavaCoderView({ width, height, margin }: IProps) {
  const [lavaCoderElt, setLavaCoderElt] = useState<HTMLDivElement | null>(null);
  const [mapType, setMapType] = useState<BaseLayerType>("aerial");
  const mapLabels: Record<BaseLayerType, string> = {
    aerial: "Terrain",
    aerialWithLabels: "Labeled",
    osm: "Street"
  };
  const [showHazardZones, setShowHazardZones] = useState(false);

  const viewer = useCesiumViewer(lavaCoderElt);

  useWorldImagery(viewer, mapType);

  const { toggleVerticalExaggeration, verticalExaggeration } = useVerticalExaggeration(viewer);

  const { isPointInHazardZone } = useHazardZones(viewer, showHazardZones, verticalExaggeration);

  useElevationData();

  useLavaOverlay(viewer);

  useCesiumClickEvent(viewer, (latitude, longitude, elevation) => {
    const isInHazardZone = isPointInHazardZone(latitude, longitude);
    const kFeetPerMeter = 3.28084;
    const elevationFeet = Math.round(elevation * kFeetPerMeter);
    // eslint-disable-next-line no-console
    console.log("Clicked at latitude:", round6(latitude), "longitude:", round6(longitude),
                "elevation:", `${Math.round(elevation)}m = ${elevationFeet}ft`,
                "in hazard zone:", isInHazardZone);
  });

  function toggleShowLabels() {
    const nextMapType: Record<BaseLayerType, BaseLayerType> = {
      aerial: "aerialWithLabels",
      aerialWithLabels: "osm",
      osm: "aerial"
    };
    setMapType(prev => nextMapType[prev]);
  }

  function toggleHazardZones() {
    setShowHazardZones(prev => !prev);
  }

  const containerStyle: React.CSSProperties = { width, height, margin };
  const borderColor = "#3baa1d";
  const iconStyle: React.CSSProperties = { marginTop: 4, marginRight: 2 };

  const mapButtonIcon = mapType === "osm" ? MapStreetIcon : MapTerrainIcon;
  const mapButtonLabel = `Map Type: ${mapLabels[mapType]}`;
  const hazardZonesLabel = showHazardZones ? "Hide Hazard Zones" : "Show Hazard Zones";
  const exaggerateLabel = verticalExaggeration === kNormalElevation
                            ? `Normal Elevation (${verticalExaggeration}x)`
                            : `Exaggerated Elevation (${verticalExaggeration}x)`;

  return (
    <div className="lava-coder-view" style={containerStyle}>
      <div ref={elt => setLavaCoderElt(elt)} className="lava-coder-simulation" />
      <div className="lava-overlay-controls">
        <IconButton className="show-labels-button" label={mapButtonLabel}
                    borderColor={borderColor} onClick={() => toggleShowLabels()}>
          <img src={mapButtonIcon} style={iconStyle} alt="Map Type" />
        </IconButton>
        <IconButton className="show-hazard-zones-button" label={hazardZonesLabel}
                    borderColor={borderColor} onClick={() => toggleHazardZones()} />
        <IconButton className="exaggerate-elevation-button" label={exaggerateLabel}
                    borderColor={borderColor} onClick={() => toggleVerticalExaggeration()} />
      </div>
    </div>
  );
}
