import { reaction } from "mobx";
import { observer } from "mobx-react";
import { useCallback, useEffect, useState } from "react";
import { CameraMode, kDefaultCameraMode, useCameraControls } from "../../hooks/lava-coder/use-camera-controls";
import { useCesiumMouseEvents } from "../../hooks/lava-coder/use-cesium-mouse-events";
import { useCesiumViewer } from "../../hooks/lava-coder/use-cesium-viewer";
import { useElevationData } from "../../hooks/lava-coder/use-elevation-data";
import { useFlagLocations } from "../../hooks/lava-coder/use-flag-locations";
import { useHazardZones } from "../../hooks/lava-coder/use-hazard-zones";
import { useLavaOverlay } from "../../hooks/lava-coder/use-lava-overlay";
import { useRulerMode } from "../../hooks/lava-coder/use-ruler-mode";
import { useShowWindPattern } from "../../hooks/lava-coder/use-show-wind-pattern";
import { useTerrainProvider } from "../../hooks/lava-coder/use-terrain-provider";
import { useVerticalExaggeration } from "../../hooks/lava-coder/use-vertical-exaggeration";
import { useVog } from "../../hooks/lava-coder/use-vog";
import { useWorldImagery } from "../../hooks/lava-coder/use-world-imagery";
import { kFeetPerMeter } from "../../simulations/lava-coder/lava-constants";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import { LavaMapType, LavaMapTypes, uiStore } from "../../stores/ui-store";
import { CartographicEventCallback, ILatLongElevation } from "../../types/lava-coder/lava-coder-types";
import { AcresCovered } from "./acres-covered-box";
import { CompassHeading } from "./compass-heading";
import { ConcordAttribution } from "./concord-attribution";
import { LatLongPopup } from "./lat-long-popup";
import {
  HomeViewIcon, LatLongIcon, MapButtonIcon, MoveIcon, RotateHeadingIcon, RotatePitchIcon, RulerIcon,
  ZoomInIcon, ZoomOutIcon
} from "./lava-coder-icons";
import { LavaIconButton } from "./lava-icon-button";
import { ProgressBar } from "./progress-bar";
import { RulerLineLabel } from "./ruler-line-label";
import { VentKey } from "./vent-key";

import "./lava-coder-view.scss";

interface IProps {
  width: number;
  height: number;
  margin: string;
  running: boolean;
}

const round6 = (value: number) => Math.round(value * 1000000) / 1000000;

// Map types reachable from the Map Type toggle while prototyping. The rest -- including the esri,
// usgs and hawaii imagery experiments -- remain implemented in use-world-imagery.ts but are not
// offered as options. See docs/lavacoder/lavacoder-optimizations.md
const kDemoMapTypes: LavaMapType[] = ["develop", "vivid", "vividWithLabels", "vividWithEsriLabels"];

export const LavaCoderView = observer(function LavaCoderView({ width, height, margin, running }: IProps) {
  const {
    showLatLongButton, showRulerButton, verticalExaggeration,
    showMapType, mapType
    // showMapType, showMapTypeTerrain, showMapTypeLabeledTerrain, showMapTypeStreet, mapType
  } = uiStore;
  const [lavaCoderElt, setLavaCoderElt] = useState<HTMLDivElement | null>(null);
  const mapLabels: Record<LavaMapType, string> = {
    develop: "Develop",
    terrain: "Terrain",
    esri: "Esri",
    usgs: "USGS",
    hawaii: "Hawaii",
    vivid: "Vivid",
    vividWithLabels: "Labeled Vivid",
    vividWithEsriLabels: "Esri Labeled Vivid",
    terrainWithLabels: "Labeled",
    street: "Street"
  };
  const [isLatLongMode, setIsLatLongMode] = useState(false);
  const [cursor, setCursor] = useState("auto");

  const { getElevation, terrainProvider } = useTerrainProvider();

  const viewer = useCesiumViewer(lavaCoderElt, mapType, terrainProvider);

  const runningAndNotPaused = running && !lavaSimulation.paused;
  const {
    cameraMode, isAnimating, animateToCameraPitch, listenToCameraChange, setCameraMode, setDefaultCameraView, zoomIn,
    zoomOut
  } = useCameraControls({ viewer, verticalExaggeration, disabled: runningAndNotPaused, getElevation });

  const { replaceBaseLayer } = useWorldImagery();

  useFlagLocations({ getElevation, viewer, verticalExaggeration });
  useVerticalExaggeration(viewer, verticalExaggeration);

  useHazardZones(viewer, isLatLongMode, verticalExaggeration);

  const clearLatLong = useCallback(() => {
    setIsLatLongMode(false);
    uiStore.clearLatLongPoint();
  }, []);

  // Close the lat/long popup when the worker is reset (e.g., when a new simulation starts)
  useEffect(() => {
    return reaction(
      () => [lavaSimulation.lavaWorker, lavaSimulation.vogWorker],
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
  useVog(viewer, verticalExaggeration);
  useShowWindPattern(viewer);

  const {
    isRulerMode, getCursor: getRulerModeCursor, handleClick: handleRulerModeClick,
    handleMouseMove: handleRulerModeMouseMove, toggleRulerMode
  } = useRulerMode({ viewer, verticalExaggeration, animateToCameraPitch, listenToCameraChange, setCursor });

  const handleMouseMove: CartographicEventCallback = useCallback(({ latitude, longitude, elevation, position }) => {
    let _cursor = "auto";
    if (isLatLongMode && !uiStore.hasLatLongPoint) _cursor = "crosshair";
    if (isRulerMode) {
      _cursor = getRulerModeCursor(position);
      handleRulerModeMouseMove({ latitude, longitude, elevation, position });
    }
    setCursor(_cursor);
  }, [getRulerModeCursor, handleRulerModeMouseMove, isLatLongMode, isRulerMode]);

  const setLatLongPoint = useCallback((latLong: ILatLongElevation) => {
    uiStore.setLatLongPoint(latLong.latitude, latLong.longitude, latLong.elevation);
  }, []);

  const handleClick: CartographicEventCallback = useCallback(({ latitude, longitude, elevation, position }) => {
    const isInHazardZone = lavaSimulation.isPointInHazardZone(latitude, longitude);
    elevation /= verticalExaggeration; // Adjust elevation for vertical exaggeration
    const elevationFeet = Math.round(elevation * kFeetPerMeter);
    // eslint-disable-next-line no-console
    console.log("Clicked at latitude:", round6(latitude), "longitude:", round6(longitude),
                "elevation:", `${Math.round(elevation)}m = ${elevationFeet}ft`,
                "in hazard zone:", isInHazardZone);
    if (isLatLongMode && !uiStore.hasLatLongPoint) {
      uiStore.setLatLongPoint(latitude, longitude, elevation);
      setCursor("auto");
    }
    if (isRulerMode) {
      handleRulerModeClick({ latitude, longitude, elevation, position });
      setCursor(getRulerModeCursor(position));
    }
  }, [getRulerModeCursor, handleRulerModeClick, isLatLongMode, isRulerMode, verticalExaggeration]);

  useCesiumMouseEvents(viewer, handleMouseMove, handleClick);

  function toggleCameraMode(mode: CameraMode) {
    setCameraMode(prev => prev === mode ? kDefaultCameraMode : mode);
  }

  function toggleMapType() {
    const availableMapTypes = LavaMapTypes.filter(type => {
      // if (type === "develop") return false; // development map type is not available via toggle
      // if (type === "terrain" && !showMapTypeTerrain) return false;
      // if (type === "terrainWithLabels" && !showMapTypeLabeledTerrain) return false;
      // if (type === "street" && !showMapTypeStreet) return false;
      return kDemoMapTypes.includes(type);
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
          <LavaIconButton
            className="lava-icon-button home-view-button"
            onClick={() => setDefaultCameraView()}
            disabled={runningAndNotPaused}
          >
            <HomeViewIcon />
          </LavaIconButton>
        </div>
        <div className="zoom-controls">
          <LavaIconButton
            className="lava-icon-button zoom-in-button"
            onClick={() => zoomIn()}
            disabled={runningAndNotPaused}
          >
            <ZoomInIcon />
          </LavaIconButton>
          <LavaIconButton
            className="lava-icon-button zoom-out-button"
            onClick={() => zoomOut()}
            disabled={runningAndNotPaused}
          >
            <ZoomOutIcon />
          </LavaIconButton>
        </div>
        <div className="rotate-pan-controls">
          <LavaIconButton className="lava-icon-button rotate-pitch-button" isActive={cameraMode === "pitch"}
                          onClick={() => toggleCameraMode("pitch")} disabled={isRulerMode || runningAndNotPaused}>
            <RotatePitchIcon />
          </LavaIconButton>
          <LavaIconButton className="lava-icon-button rotate-heading-button" isActive={cameraMode === "heading"}
                          onClick={() => toggleCameraMode("heading")} disabled={runningAndNotPaused}>
            <RotateHeadingIcon />
          </LavaIconButton>
          <LavaIconButton className="lava-icon-button panning-mode-button" isActive={cameraMode === "panning"}
                          onClick={() => toggleCameraMode("panning")} disabled={runningAndNotPaused}>
            <MoveIcon />
          </LavaIconButton>
        </div>
      </div>
      { isLatLongMode && <VentKey /> }
      <div className="lava-overlay-controls-bottom bottom-left-controls">
        {showLatLongButton && (
          <LavaIconButton className="lat-long-button" width={26} label={"Lat/Long"} isActive={isLatLongMode}
                          onClick={() => toggleLatLongMode()} disabled={isRulerMode || running}>
            <LatLongIcon />
          </LavaIconButton>
        )}
        {showRulerButton && (
          <LavaIconButton className="ruler-button" width={26} label={"Ruler"} isActive={isRulerMode}
                          onClick={() => toggleRulerMode()} disabled={isLatLongMode || isAnimating || running}>
            <RulerIcon />
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
      {isRulerMode && <RulerLineLabel viewer={viewer} listenToCameraChange={listenToCameraChange} />}
    </div>
  );
});
