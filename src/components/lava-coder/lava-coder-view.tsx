import { reaction } from "mobx";
import { observer } from "mobx-react";
import { useCallback, useEffect, useRef, useState } from "react";
import VentLocationMarkerIcon from "../../assets/lava-coder/location-marker.png";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import { LavaMapType, LavaMapTypes, uiStore } from "../../stores/ui-store";
import { AcresCovered } from "./acres-covered-box";
import { CompassHeading } from "./compass-heading";
import { ConcordAttribution } from "./concord-attribution";
import {
  HomeViewIcon, MapButtonIcon, MoveIcon, PlaceVentMarkerIcon, RotateHeadingIcon, RotatePitchIcon,
  ZoomInIcon, ZoomOutIcon
} from "./lava-coder-icons";
import { kFeetPerMeter } from "./lava-constants";
import { LavaIconButton } from "./lava-icon-button";
import { ProgressBar } from "./progress-bar";
import { CameraMode, kDefaultCameraMode, useCameraControls } from "./use-camera-controls";
import { useCesiumMouseEvents } from "./use-cesium-mouse-events";
import { useCesiumViewer } from "./use-cesium-viewer";
import { useElevationData } from "./use-elevation-data";
import { useHazardZones } from "./use-hazard-zones";
import { useLavaOverlay } from "./use-lava-overlay";
import { useVentLocationMarker } from "./use-vent-location-marker";
import { useVerticalExaggeration } from "./use-vertical-exaggeration";
import { useWorldImagery } from "./use-world-imagery";
import { VentKey } from "./vent-key";
import { VentLocationPopup } from "./vent-location-popup";

import "./lava-coder-view.scss";

interface IProps {
  width: number;
  height: number;
  margin: string;
  running: boolean;
}

const round6 = (value: number) => Math.round(value * 1000000) / 1000000;

export const LavaCoderView = observer(function LavaCoderView({ width, height, margin, running }: IProps) {
  const lastRunningTime = useRef(0);
  const {
    showPlaceVent, showMapType, showMapTypeTerrain, showMapTypeLabeledTerrain, showMapTypeStreet, mapType,
    verticalExaggeration
  } = uiStore;
  const [lavaCoderElt, setLavaCoderElt] = useState<HTMLDivElement | null>(null);
  const mapLabels: Record<LavaMapType, string> = {
    develop: "Develop",
    terrain: "Terrain",
    terrainWithLabels: "Labeled",
    street: "Street"
  };
  const [isPlaceVentMode, setIsPlaceVentMode] = useState(false);
  const [_showVentLocationPopup, setShowVentLocationPopup] = useState(false);
  const [cursor, setCursor] = useState("auto");

  const viewer = useCesiumViewer(lavaCoderElt, mapType);

  const { cameraMode, setCameraMode, setDefaultCameraView, zoomIn, zoomOut } =
    useCameraControls(viewer, verticalExaggeration);

  const { replaceBaseLayer } = useWorldImagery();

  useVerticalExaggeration(viewer, verticalExaggeration);

  const { isPointInHazardZone } = useHazardZones(viewer, isPlaceVentMode, verticalExaggeration);

  const handleOpenVentLocationPopup = useCallback(() => {
    setShowVentLocationPopup(true);
  }, []);

  const handleCloseVentLocationPopup = useCallback(() => {
    setShowVentLocationPopup(false);
  }, []);

  // Close the vent location popup when the worker is reset (e.g., when a new simulation starts)
  useEffect(() => {
    return reaction(
      () => lavaSimulation.worker,
      () => handleCloseVentLocationPopup()
    );
  }, [handleCloseVentLocationPopup]);

  useEffect(() => {
    return reaction(
      () => lavaSimulation.resetCount,
      () => handleCloseVentLocationPopup()
    );
  }, [handleCloseVentLocationPopup]);

  // Update the last running time when the running state changes
  if (running) lastRunningTime.current = Date.now();
  // There can be a gap between the blockly running state and the lava simulation running state, which
  // can result in flashing the vent location marker, so we enforce a delay after blockly running.
  const isRunning = running ||
                    (lastRunningTime.current > 0 && Date.now() - lastRunningTime.current < 1000) ||
                    lavaSimulation.isRunning;
  const showVentLocationPopup = _showVentLocationPopup && !isRunning;
  useVentLocationMarker({ viewer, verticalExaggeration, onClick: handleOpenVentLocationPopup, hide: isRunning });

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
      lavaSimulation.setVentLocation(latitude, longitude, elevation / verticalExaggeration);
      setShowVentLocationPopup(true);
    }
    setIsPlaceVentMode(false);
    setCursor("auto");
  }, [isPlaceVentMode, isPointInHazardZone, verticalExaggeration]);

  useCesiumMouseEvents(viewer, handleMouseMove, handleClick);

  function toggleCameraMode(mode: CameraMode) {
    setCameraMode(prev => prev === mode ? kDefaultCameraMode : mode);
  }

  function toggleMapType() {
    const availableMapTypes = LavaMapTypes.filter(type => {
      if (type === "develop") return false; // development map type is not available via toggle
      if (type === "terrain" && !showMapTypeTerrain) return false;
      if (type === "terrainWithLabels" && !showMapTypeLabeledTerrain) return false;
      if (type === "street" && !showMapTypeStreet) return false;
      return true;
    });
    const currMapIndex = availableMapTypes.indexOf(mapType);
    const nextMapType = availableMapTypes[(currMapIndex + 1) % availableMapTypes.length];
    uiStore.setMapType(nextMapType);
    replaceBaseLayer(viewer, nextMapType);
  }

  function togglePlaceVentMode() {
    setIsPlaceVentMode(prev => !prev);
  }

  const containerStyle: React.CSSProperties = { width, height, margin, cursor };

  const mapButtonLabel = `Map Type: ${mapLabels[mapType]}`;

  return (
    <div className="lava-coder-view" style={containerStyle}>
      <div ref={elt => setLavaCoderElt(elt)} className="lava-coder-simulation" />
      <div className="lava-overlay-controls-left">
        <div className="compass-heading-indicator">
          <CompassHeading viewer={viewer} />
        </div>
        <div className="home-view-controls">
          <LavaIconButton className="lava-icon-button home-view-button" onClick={() => setDefaultCameraView()}>
            <HomeViewIcon />
          </LavaIconButton>
        </div>
        <div className="zoom-controls">
          <LavaIconButton className="lava-icon-button zoom-in-button" onClick={() => zoomIn()}>
            <ZoomInIcon />
          </LavaIconButton>
          <LavaIconButton className="lava-icon-button zoom-out-button" onClick={() => zoomOut()}>
            <ZoomOutIcon />
          </LavaIconButton>
        </div>
        <div className="rotate-pan-controls">
          <LavaIconButton className="lava-icon-button rotate-pitch-button" isActive={cameraMode === "pitch"}
                          onClick={() => toggleCameraMode("pitch")}>
            <RotatePitchIcon />
          </LavaIconButton>
          <LavaIconButton className="lava-icon-button rotate-heading-button" isActive={cameraMode === "heading"}
                          onClick={() => toggleCameraMode("heading")}>
            <RotateHeadingIcon />
          </LavaIconButton>
          <LavaIconButton className="lava-icon-button panning-mode-button" isActive={cameraMode === "panning"}
                          onClick={() => toggleCameraMode("panning")}>
            <MoveIcon />
          </LavaIconButton>
        </div>
      </div>
      { isPlaceVentMode && <VentKey /> }
      <div className="lava-overlay-controls-bottom bottom-left-controls">
        {showPlaceVent && (
          <LavaIconButton className="place-vent-button" label={"Place Vent"} isActive={isPlaceVentMode}
                          onClick={() => togglePlaceVentMode()} disabled={isRunning}>
            <PlaceVentMarkerIcon />
          </LavaIconButton>
        )}
      </div>
      <div className="lava-overlay-controls-bottom bottom-right-controls">
        {showMapType && (
          <LavaIconButton className="map-type-button" label={mapButtonLabel} onClick={() => toggleMapType()}>
            <MapButtonIcon mapType={mapType} />
          </LavaIconButton>
        )}
      </div>
      <AcresCovered />
      <ProgressBar pulseCount={lavaSimulation.pulseCount} pulses={uiStore.pulsesPerEruption} />
      <ConcordAttribution />
      <VentLocationPopup viewer={viewer} verticalExaggeration={verticalExaggeration}
                        show={showVentLocationPopup} onClose={handleCloseVentLocationPopup}/>
    </div>
  );
});
