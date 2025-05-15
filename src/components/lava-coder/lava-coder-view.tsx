
import { useCallback, useState } from "react";
import VentLocationMarkerIcon from "../../assets/lava-coder/location-marker.png";
import MapStreetIcon from "../../assets/lava-coder/map-street-icon.png";
import MapTerrainIcon from "../../assets/lava-coder/map-terrain-icon.png";
import PlaceVentMarkerIcon from "../../assets/lava-coder/place-vent-marker-icon.png";
import IconButton from "../buttons/icon-button";
import { kFeetPerMeter } from "./lava-constants";
import { useCesiumMouseEvents } from "./use-cesium-mouse-events";
import { useCesiumViewer } from "./use-cesium-viewer";
import { useElevationData } from "./use-elevation-data";
import { useHazardZones } from "./use-hazard-zones";
import { useLavaOverlay } from "./use-lava-overlay";
import { useVentLocationMarker } from "./use-vent-location-marker";
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
  const [isPlaceVentMode, setIsPlaceVentMode] = useState(false);
  const [cursor, setCursor] = useState("auto");

  const viewer = useCesiumViewer(lavaCoderElt);

  useWorldImagery(viewer, mapType);

  const { toggleVerticalExaggeration, verticalExaggeration } = useVerticalExaggeration(viewer);

  const { isPointInHazardZone } = useHazardZones(viewer, isPlaceVentMode, verticalExaggeration);

  const { setVentLocation } = useVentLocationMarker(viewer);

  useElevationData();

  useLavaOverlay(viewer);

  const handleMouseMove = useCallback((latitude, longitude) => {
    // handle mouse move event
    const isInHazardZone = isPointInHazardZone(latitude, longitude);
    const kVentLocationCursorHotSpot = "13 36";
    setCursor(isPlaceVentMode
                ? isInHazardZone
                    ? `url(${VentLocationMarkerIcon}) ${kVentLocationCursorHotSpot}, auto`
                    : "not-allowed"
                : "auto");
  }, [isPlaceVentMode, isPointInHazardZone]);

  const handleClick = useCallback((latitude, longitude, elevation) => {
    const isInHazardZone = isPointInHazardZone(latitude, longitude);
    const elevationFeet = Math.round(elevation * kFeetPerMeter);
    // eslint-disable-next-line no-console
    console.log("Clicked at latitude:", round6(latitude), "longitude:", round6(longitude),
                "elevation:", `${Math.round(elevation)}m = ${elevationFeet}ft`,
                "in hazard zone:", isInHazardZone);
    if (isPlaceVentMode && isInHazardZone) {
      setVentLocation(latitude, longitude, elevation);
    }
    setIsPlaceVentMode(false);
    setCursor("auto");
  }, [isPlaceVentMode, isPointInHazardZone, setVentLocation]);

  useCesiumMouseEvents(viewer, handleMouseMove, handleClick);

  function toggleShowLabels() {
    const nextMapType: Record<BaseLayerType, BaseLayerType> = {
      aerial: "aerialWithLabels",
      aerialWithLabels: "osm",
      osm: "aerial"
    };
    setMapType(prev => nextMapType[prev]);
  }

  function togglePlaceVentMode() {
    setIsPlaceVentMode(prev => !prev);
  }

  // place hot spot for vent location cursor at point of marker
  const containerStyle: React.CSSProperties = { width, height, margin, cursor };
  const borderColor = "#3baa1d";
  const iconStyle: React.CSSProperties = { marginTop: 4, marginRight: 2 };

  const mapButtonIcon = mapType === "osm" ? MapStreetIcon : MapTerrainIcon;
  const mapButtonLabel = `Map Type: ${mapLabels[mapType]}`;
  const exaggerateLabel = verticalExaggeration === kNormalElevation
                            ? `Normal Elevation (${verticalExaggeration}x)`
                            : `Exaggerated Elevation (${verticalExaggeration}x)`;

  return (
    <div className="lava-coder-view" style={containerStyle}>
      <div ref={elt => setLavaCoderElt(elt)} className="lava-coder-simulation" />
      <div className="lava-overlay-controls-left">
        <IconButton className="place-vent-button" label={"Place Vent"}
                    borderColor={borderColor} onClick={() => togglePlaceVentMode()}>
          <img src={PlaceVentMarkerIcon} style={iconStyle} alt="Place Vent" />
        </IconButton>
      </div>
      <div className="lava-overlay-controls-right">
        <IconButton className="show-labels-button" label={mapButtonLabel}
                    borderColor={borderColor} onClick={() => toggleShowLabels()}>
          <img src={mapButtonIcon} style={iconStyle} alt="Map Type" />
        </IconButton>
        <IconButton className="exaggerate-elevation-button" label={exaggerateLabel}
                    borderColor={borderColor} onClick={() => toggleVerticalExaggeration()} />
      </div>
    </div>
  );
}
