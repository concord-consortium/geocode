import { reaction } from "mobx";
import { observer } from "mobx-react";
import { useCallback, useEffect, useState } from "react";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import { LavaMapType, LavaMapTypes, uiStore } from "../../stores/ui-store";
import { AcresCovered } from "./acres-covered-box";
import { CompassHeading } from "./compass-heading";
import { ConcordAttribution } from "./concord-attribution";
import { ILatLongElevation, LatLongPopup } from "./lat-long-popup";
import {
  HomeViewIcon, LatLongIcon, MapButtonIcon, MoveIcon, RotateHeadingIcon, RotatePitchIcon,
  ZoomInIcon, ZoomOutIcon
} from "./lava-coder-icons";
import { kFeetPerMeter } from "./lava-constants";
import { LavaIconButton } from "./lava-icon-button";
import { ProgressBar } from "./progress-bar";
import { CameraMode, kDefaultCameraMode, useCameraControls } from "./use-camera-controls";
import { useCesiumMouseEvents } from "./use-cesium-mouse-events";
import { useCesiumViewer } from "./use-cesium-viewer";
import { useElevationData } from "./use-elevation-data";
import { useFlagLocations } from "./use-flag-locations";
import { useHazardZones } from "./use-hazard-zones";
import { useLavaOverlay } from "./use-lava-overlay";
import { useVerticalExaggeration } from "./use-vertical-exaggeration";
import { useWorldImagery } from "./use-world-imagery";
import { VentKey } from "./vent-key";

import "./lava-coder-view.scss";

interface IProps {
  width: number;
  height: number;
  margin: string;
  running: boolean;
}

const round6 = (value: number) => Math.round(value * 1000000) / 1000000;

export const LavaCoderView = observer(function LavaCoderView({ width, height, margin, running }: IProps) {
  const {
    showLatLongButton, showMapType, showMapTypeTerrain, showMapTypeLabeledTerrain, showMapTypeStreet, mapType,
    verticalExaggeration
  } = uiStore;
  const [lavaCoderElt, setLavaCoderElt] = useState<HTMLDivElement | null>(null);
  const mapLabels: Record<LavaMapType, string> = {
    develop: "Develop",
    terrain: "Terrain",
    terrainWithLabels: "Labeled",
    street: "Street"
  };
  const [isLatLongMode, setIsLatLongMode] = useState(false);
  const [cursor, setCursor] = useState<"auto" | "crosshair">("auto");

  const viewer = useCesiumViewer(lavaCoderElt, mapType);

  const { cameraMode, setCameraMode, setDefaultCameraView, zoomIn, zoomOut } =
    useCameraControls(viewer, verticalExaggeration);

  const { replaceBaseLayer } = useWorldImagery();

  useFlagLocations({ viewer, verticalExaggeration });
  useVerticalExaggeration(viewer, verticalExaggeration);

  useHazardZones(viewer, isLatLongMode, verticalExaggeration);

  const clearLatLong = useCallback(() => {
    setIsLatLongMode(false);
    uiStore.clearLatLongPoint();
  }, []);

  // Close the lat/long popup when the worker is reset (e.g., when a new simulation starts)
  useEffect(() => {
    return reaction(
      () => lavaSimulation.worker,
      () => clearLatLong()
    );
  }, [clearLatLong]);

  useEffect(() => {
    return reaction(
      () => lavaSimulation.resetCount,
      () => clearLatLong()
    );
  }, [clearLatLong]);

  const latLongPopupMode = isLatLongMode && !running
                            ? uiStore.hasLatLongPoint ? "static" : "dynamic"
                            : undefined;

  useElevationData();

  useLavaOverlay(viewer);

  const handleMouseMove = useCallback(() => {
    setCursor(isLatLongMode && !uiStore.hasLatLongPoint ? "crosshair" : "auto");
  }, [isLatLongMode]);

  const setLatLongPoint = useCallback((latLong: ILatLongElevation) => {
    uiStore.setLatLongPoint(latLong.latitude, latLong.longitude, latLong.elevation);
  }, []);

  const handleClick = useCallback((latitude, longitude, elevation) => {
    const isInHazardZone = lavaSimulation.isPointInHazardZone(latitude, longitude);
    elevation /= verticalExaggeration; // Adjust elevation for vertical exaggeration
    const elevationFeet = Math.round(elevation * kFeetPerMeter);
    // eslint-disable-next-line no-console
    console.log("Clicked at latitude:", round6(latitude), "longitude:", round6(longitude),
                "elevation:", `${Math.round(elevation)}m = ${elevationFeet}ft`,
                "in hazard zone:", isInHazardZone);
    if (isLatLongMode && !uiStore.hasLatLongPoint) {
      uiStore.setLatLongPoint(latitude, longitude, elevation);
    }
    setCursor("auto");
  }, [isLatLongMode, verticalExaggeration]);

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

  function toggleLatLongMode() {
    setIsLatLongMode(prev => !prev);
    uiStore.clearLatLongPoint();
  }

  const containerStyle: React.CSSProperties = { width, height, margin, cursor };

  const mapButtonLabel = `Map Type: ${mapLabels[mapType]}`;

  return (
    <div className="lava-coder-view" style={containerStyle}>
      <div ref={elt => setLavaCoderElt(elt)} className="lava-coder-simulation" />
      <ProgressBar pulseCount={lavaSimulation.pulseCount} pulses={uiStore.pulsesPerEruption} />
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
      { isLatLongMode && <VentKey /> }
      <div className="lava-overlay-controls-bottom bottom-left-controls">
        {showLatLongButton && (
          <LavaIconButton className="lat-long-button" width={26} label={"Lat/Long"} isActive={isLatLongMode}
                          onClick={() => toggleLatLongMode()} disabled={running}>
            <LatLongIcon />
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
      <ConcordAttribution />
      <LatLongPopup viewer={viewer} verticalExaggeration={verticalExaggeration}
                    mode={latLongPopupMode} onSetLatLongPoint={setLatLongPoint} />
    </div>
  );
});
