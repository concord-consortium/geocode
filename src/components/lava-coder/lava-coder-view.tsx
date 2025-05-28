import { observer } from "mobx-react";
import { useCallback, useState } from "react";
import VentLocationMarkerIcon from "../../assets/lava-coder/location-marker.png";
import MapStreetIcon from "../../assets/lava-coder/map-street-icon.png";
import MapTerrainIcon from "../../assets/lava-coder/map-terrain-icon.png";
import MoveIcon from "../../assets/lava-coder/move-icon.png";
import PlaceVentMarkerIcon from "../../assets/lava-coder/place-vent-marker-icon.png";
import RotateIcon from "../../assets/lava-coder/rotate-icon.png";
import ZoomInIcon from "../../assets/lava-coder/zoom-in-icon.png";
import ZoomOutIcon from "../../assets/lava-coder/zoom-out-icon.png";
import { LavaMapType, LavaMapTypes, uiStore } from "../../stores/ui-store";
import { kFeetPerMeter } from "./lava-constants";
import { LavaIconButton } from "./lava-icon-button";
import { CameraMode, kDefaultCameraMode, useCameraControls } from "./use-camera-controls";
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

  const { cameraMode, setCameraMode, zoomIn, zoomOut } = useCameraControls(viewer, verticalExaggeration);

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

  function toggleCameraMode(mode: CameraMode) {
    setCameraMode(prev => prev === mode ? kDefaultCameraMode : mode);
  }

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

  const containerStyle: React.CSSProperties = { width, height, margin, cursor };

  const mapButtonIcon = mapType === "street" ? MapStreetIcon : MapTerrainIcon;
  const mapButtonLabel = `Map Type: ${mapLabels[mapType]}`;

  return (
    <div className="lava-coder-view" style={containerStyle}>
      <div ref={elt => setLavaCoderElt(elt)} className="lava-coder-simulation" />
      <div className="lava-overlay-controls-left">
        <div className="zoom-controls">
          <LavaIconButton className="lava-icon-button zoom-in-button" onClick={() => zoomIn()}>
            <img src={ZoomInIcon} alt="Zoom In" />
          </LavaIconButton>
          <LavaIconButton className="lava-icon-button zoom-out-button" onClick={() => zoomOut()}>
            <img src={ZoomOutIcon} alt="Zoom Out" />
          </LavaIconButton>
        </div>
        <div className="rotate-pan-controls">
          <LavaIconButton className="lava-icon-button rotate-pitch-button" isActive={cameraMode === "pitch"}
                          onClick={() => toggleCameraMode("pitch")}>
            <img src={RotateIcon} alt="Enable Camera Pitch Rotation" />
          </LavaIconButton>
          <LavaIconButton className="lava-icon-button rotate-heading-button" isActive={cameraMode === "heading"}
                          onClick={() => toggleCameraMode("heading")}>
            <img src={RotateIcon} alt="Enable Camera Heading Rotation" />
          </LavaIconButton>
          <LavaIconButton className="lava-icon-button panning-mode-button" isActive={cameraMode === "panning"}
                          onClick={() => toggleCameraMode("panning")}>
            <img src={MoveIcon} alt="Enable Camera Panning" />
          </LavaIconButton>
        </div>
      </div>
      <div className="lava-overlay-controls-bottom bottom-left-controls">
        {showPlaceVent && (
          <LavaIconButton className="place-vent-button" label={"Place Vent"} onClick={() => togglePlaceVentMode()}>
            <img src={PlaceVentMarkerIcon} alt="Place Vent" />
          </LavaIconButton>
        )}
      </div>
      <div className="lava-overlay-controls-bottom bottom-right-controls">
        {showMapType && (
          <LavaIconButton className="map-type-button" label={mapButtonLabel} onClick={() => toggleMapType()}>
            <img src={mapButtonIcon} alt="Map Type" />
          </LavaIconButton>
        )}
      </div>
      <VentLocationPopup viewer={viewer} ventLocation={ventLocation} verticalExaggeration={verticalExaggeration}
                        show={showVentLocationPopup} onClose={handleCloseVentLocationPopup}/>
    </div>
  );
});
