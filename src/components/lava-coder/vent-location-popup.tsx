import { Cartesian3, CesiumWidget } from "@cesium/engine";
import React, { useEffect, useRef, useState } from "react";
import CopiedButtonIcon from "../../assets/lava-coder/content-copied-icon.png";
import CopyButtonIcon from "../../assets/lava-coder/content-copy-icon.png";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import IconButton from "../buttons/icon-button";

import "./vent-location-popup.scss";

interface IProps {
  viewer: CesiumWidget | null;
  verticalExaggeration: number;
  show: boolean;
  onClose: () => void;
}

const kWidth = 168;
const kHeight = 42;
// The vertical offset of the popup from the bottom of the marker
const kVerticalOffset = 48;
const kBorderColor = "#3baa1d";

function degToStr(value: number) {
  return `${value.toFixed(3)}`;
}

export function VentLocationPopup({ viewer, verticalExaggeration, show, onClose }: IProps) {
  const [copiedVentLocation, setCopiedVentLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // focus the popup when it is shown
    if (show && popupRef.current) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      popupRef.current.focus();
    }
    // return focus to the previously focused element when the popup is closed
    return () => {
      previouslyFocused.current?.focus();
    };
  }, [show]);

  if (!show) return null;

  const { pinLatitude: latitude, pinLongitude: longitude, pinElevation: height } = lavaSimulation;
  const cartesian = Cartesian3.fromDegrees(longitude, latitude, height * verticalExaggeration);
  const scene = viewer?.scene;
  const screenPosition = scene?.cartesianToCanvasCoordinates(cartesian);
  if (!screenPosition) return null;

  const popupStyle: React.CSSProperties = {
    position: "absolute",
    left: `${screenPosition.x - kWidth / 2}px`,
    top: `${screenPosition.y - kHeight - kVerticalOffset}px`,
    width: `${kWidth}px`,
    height: `${kHeight}px`,
    backgroundColor: "white"
  };

  function copyLocation() {
    const latLongStr = `${degToStr(latitude)},${degToStr(longitude)}`;
    navigator.clipboard.writeText(latLongStr)
      .then(() => setCopiedVentLocation( { latitude, longitude }))
      .catch((err) => {
        console.error("Failed to copy vent location:", err);
      });
  }

  function handleClose() {
    setCopiedVentLocation(null);
    onClose();
  }

  const isCopied = copiedVentLocation?.latitude === latitude &&
                  copiedVentLocation?.longitude === longitude;
  const imgIcon = isCopied ? CopiedButtonIcon : CopyButtonIcon;
  const imgAlt = isCopied ? "Copied" : "Copy";

  return (
    <>
      <div
        className="vent-location-popup-background" onPointerDownCapture={handleClose}
        aria-hidden="true" role="presentation" tabIndex={-1} />
      <div className="vent-location-popup" style={popupStyle}>
        <div className="latitude label">Lat:</div>
        <div className="latitude value">{`${degToStr(latitude)}°`}</div>
        <div className="longitude label">Long:</div>
        <div className="longitude value">{`${degToStr(longitude)}°`}</div>
        <IconButton className="copy-button" borderColor={kBorderColor} onClick={copyLocation}>
          <img src={imgIcon} alt={imgAlt} />
        </IconButton>
      </div>
    </>
  );
}
