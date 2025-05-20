import { observer } from "mobx-react";
import { useCallback, useState } from "react";
import VentLocationMarkerIcon from "../../assets/lava-coder/location-marker.png";
import MapStreetIcon from "../../assets/lava-coder/map-street-icon.png";
import MapTerrainIcon from "../../assets/lava-coder/map-terrain-icon.png";
import PlaceVentMarkerIcon from "../../assets/lava-coder/place-vent-marker-icon.png";
import ZoomInIcon from "../../assets/lava-coder/zoom-in-icon.png";
import ZoomOutIcon from "../../assets/lava-coder/zoom-out-icon.png";
import { LavaMapType, LavaMapTypes, uiStore } from "../../stores/ui-store";
import IconButton from "../buttons/icon-button";
import { kFeetPerMeter } from "./lava-constants";
import { useCameraControls } from "./use-camera-controls";
import { useCesiumMouseEvents } from "./use-cesium-mouse-events";
import { useCesiumViewer } from "./use-cesium-viewer";
import { useElevationData } from "./use-elevation-data";
import { useHazardZones } from "./use-hazard-zones";
import { useLavaOverlay } from "./use-lava-overlay";
import { useVentLocationMarker } from "./use-vent-location-marker";
import { useVerticalExaggeration } from "./use-vertical-exaggeration";
import { useWorldImagery } from "./use-world-imagery";
import { VentLocationPopup } from "./vent-location-popup";

import "./lava-coder-view.scss";

interface IProps {
  width: number;
  height: number;
  margin: string;
}

const round6 = (value: number) => Math.round(value * 1000000) / 1000000;

export const LavaCoderView = observer(function LavaCoderView({ width, height, margin }: IProps) {
  const {
    showPlaceVent, showMapType, showMapTypeTerrain, showMapTypeLabeledTerrain, showMapTypeStreet, mapType,
    verticalExaggeration
  } = uiStore;
  const [lavaCoderElt, setLavaCoderElt] = useState<HTMLDivElement | null>(null);
  const mapLabels: Record<LavaMapType, string> = {
    terrain: "Terrain",
    terrainWithLabels: "Labeled",
    street: "Street"
  };
  const [isPlaceVentMode, setIsPlaceVentMode] = useState(false);
  const [showVentLocationPopup, setShowVentLocationPopup] = useState(false);
  const [cursor, setCursor] = useState("auto");

  const viewer = useCesiumViewer(lavaCoderElt);

  const { zoomIn, zoomOut } = useCameraControls(viewer);

  useWorldImagery(viewer, mapType);

  useVerticalExaggeration(viewer, verticalExaggeration);

  const { isPointInHazardZone } = useHazardZones(viewer, isPlaceVentMode, verticalExaggeration);

  const handleOpenVentLocationPopup = useCallback(() => {
    setShowVentLocationPopup(true);
  }, []);

  const handleCloseVentLocationPopup = useCallback(() => {
    setShowVentLocationPopup(false);
  }, []);

  const { ventLocation, setVentLocation } =
    useVentLocationMarker(viewer, verticalExaggeration, handleOpenVentLocationPopup);

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
      setVentLocation(latitude, longitude, elevation / verticalExaggeration);
      setShowVentLocationPopup(true);
    }
    setIsPlaceVentMode(false);
    setCursor("auto");
  }, [isPlaceVentMode, isPointInHazardZone, setVentLocation, verticalExaggeration]);

  useCesiumMouseEvents(viewer, handleMouseMove, handleClick);

  function toggleMapType() {
    const availableMapTypes = LavaMapTypes.filter(type => {
      if (type === "terrain" && !showMapTypeTerrain) return false;
      if (type === "terrainWithLabels" && !showMapTypeLabeledTerrain) return false;
      if (type === "street" && !showMapTypeStreet) return false;
      return true;
    });
    const currMapIndex = availableMapTypes.indexOf(mapType);
    const nextMapType = availableMapTypes[(currMapIndex + 1) % availableMapTypes.length];
    uiStore.setMapType(nextMapType);
  }

  function togglePlaceVentMode() {
    setIsPlaceVentMode(prev => !prev);
  }

  // place hot spot for vent location cursor at point of marker
  const containerStyle: React.CSSProperties = { width, height, margin, cursor };
  const borderColor = "#3baa1d";
  const unlabeledIconStyle: React.CSSProperties = { marginTop: -2, marginLeft: -2 };
  const labeledIconStyle: React.CSSProperties = { marginTop: 4, marginRight: 2 };

  const mapButtonIcon = mapType === "street" ? MapStreetIcon : MapTerrainIcon;
  const mapButtonLabel = `Map Type: ${mapLabels[mapType]}`;

  return (
    <div className="lava-coder-view" style={containerStyle}>
      <div ref={elt => setLavaCoderElt(elt)} className="lava-coder-simulation" />
      <div className="lava-overlay-controls-left">
        <div className="zoom-controls">
          <IconButton className="zoom-in-button" width={34} height={34}
                      borderColor={borderColor} onClick={() => zoomIn()}>
            <img src={ZoomInIcon} style={unlabeledIconStyle} alt="Zoom In" />
          </IconButton>
          <IconButton className="zoom-out-button" width={34} height={34}
                      borderColor={borderColor} onClick={() => zoomOut()}>
            <img src={ZoomOutIcon} style={unlabeledIconStyle} alt="Zoom Out" />
          </IconButton>
        </div>
      </div>
      <div className="lava-overlay-controls-bottom-left">
        {showPlaceVent && (
          <IconButton className="place-vent-button" label={"Place Vent"}
                      borderColor={borderColor} onClick={() => togglePlaceVentMode()}>
            <img src={PlaceVentMarkerIcon} style={labeledIconStyle} alt="Place Vent" />
          </IconButton>
        )}
      </div>
      <div className="lava-overlay-controls-bottom-right">
        {showMapType && (
          <IconButton className="map-type-button" label={mapButtonLabel}
                      borderColor={borderColor} onClick={() => toggleMapType()}>
            <img src={mapButtonIcon} style={labeledIconStyle} alt="Map Type" />
          </IconButton>
        )}
      </div>
      <VentLocationPopup viewer={viewer} ventLocation={ventLocation} verticalExaggeration={verticalExaggeration}
                        show={showVentLocationPopup} onClose={handleCloseVentLocationPopup}/>
    </div>
  );
});
