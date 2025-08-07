import { Cartesian2, Cartesian3, Cartographic, CesiumWidget } from "@cesium/engine";
import React, { useEffect, useRef, useState } from "react";
import CopiedButtonIcon from "../../assets/lava-coder/content-copied-icon.png";
import CopyButtonIcon from "../../assets/lava-coder/content-copy-icon.png";
import LatLongIconNoShadow from "../../assets/lava-coder/lat-long-icon-no-shadow.svg";
import { uiStore } from "../../stores/ui-store";
import IconButton from "../buttons/icon-button";

import "./lat-long-popup.scss";

interface IProps {
  viewer: CesiumWidget | null;
  verticalExaggeration: number;
  // static shows location stored in uiStore, dynamic shows location under cursor
  mode?: "static" | "dynamic";
}

const kWidthWithCopy = 168;
const kWidthWithoutCopy = 125;
const kPopupHeight = 42;
// The vertical offset of the popup from the bottom of the marker
const kBorderColor = "#3baa1d";

function degToStr(value: number) {
  return `${value.toFixed(3)}`;
}

interface ILatLong {
  latitude: number;
  longitude: number;
}

export function LatLongPopup({ viewer, verticalExaggeration, mode }: IProps) {
  const [cursorPos, setCursorPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [cursorLatLong, setCursorLatLong] = useState<ILatLong | null>(null);
  const [copiedLatLong, setCopiedLatLong] = useState<ILatLong | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // focus the popup when it is shown
    if (mode && popupRef.current) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      popupRef.current.focus();
    }
    // return focus to the previously focused element when the popup is closed
    return () => {
      previouslyFocused.current?.focus();
    };
  }, [mode]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const containerElt = viewer?.container;
      if (!containerElt) return;
      const { left: containerX, top: containerY } = containerElt.getBoundingClientRect();
      const x = event.clientX - containerX;
      const y = event.clientY - containerY;
      setCursorPos({ x, y });

      // Convert screen position to Cesium Cartesian2
      const scene = viewer.scene;
      const screenPosition = new Cartesian2(x, y);

      // Get the pick ray and intersection with the globe
      const ray = scene.camera.getPickRay(screenPosition);
      const pickedPosition = ray ? scene.globe.pick(ray, scene) : null;

      if (pickedPosition) {
        const cartPos = Cartographic.fromCartesian(pickedPosition);
        setCursorLatLong({
          latitude: cartPos.latitude * 180 / Math.PI,
          longitude: cartPos.longitude * 180 / Math.PI
        });
      }
    }

    window.addEventListener("pointermove", handlePointerMove, true);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove, true);
    };
  }, [viewer]);

  if (!mode || (mode === "dynamic" && !cursorLatLong)) return null;

  const latitude = mode === "static" ? uiStore.pointLatitude : cursorLatLong?.latitude;
  const longitude = mode === "static" ? uiStore.pointLongitude : cursorLatLong?.longitude;
  const elevation = mode === "static" ? uiStore.pointElevation : 0; // Elevation is not used in dynamic mode
  if (latitude == null || longitude == null || elevation == null) return null;

  let popupLeft = cursorPos.x - 1;
  let popupTop = cursorPos.y - kPopupHeight - 4;

  if (mode === "static") {
    const cartesian = Cartesian3.fromDegrees(longitude, latitude, elevation * verticalExaggeration);
    const scene = viewer?.scene;
    const screenPosition = scene?.cartesianToCanvasCoordinates(cartesian);
    if (!screenPosition) return null;
    popupLeft = screenPosition.x;
    popupTop = screenPosition.y - kPopupHeight;
  }

  const popupStyle: React.CSSProperties = {
    position: "absolute",
    left: popupLeft,
    top: popupTop,
    width: mode === "static" ? kWidthWithCopy : kWidthWithoutCopy,
    height: kPopupHeight,
    backgroundColor: "white"
  };

  function copyLocation() {
    if (latitude == null || longitude == null) return;
    // Copy the latitude and longitude to the clipboard
    const latLongStr = `${degToStr(latitude)},${degToStr(longitude)}`;
    navigator.clipboard.writeText(latLongStr)
      .then(() => setCopiedLatLong( { latitude, longitude }))
      .catch((err) => {
        console.error("Failed to copy vent location:", err);
      });
  }

  const isCopied = copiedLatLong?.latitude === latitude &&
                  copiedLatLong?.longitude === longitude;
  const imgIcon = isCopied ? CopiedButtonIcon : CopyButtonIcon;
  const imgAlt = isCopied ? "Copied" : "Copy";

  return (
    <div className="lat-long-popup" ref={popupRef} style={popupStyle}>
      <div className="latitude label">Lat:</div>
      <div className="latitude value">{`${degToStr(latitude)}°`}</div>
      <div className="longitude label">Long:</div>
      <div className="longitude value">{`${degToStr(longitude)}°`}</div>
      {mode === "static" && (
        <>
          <IconButton className="copy-button" borderColor={kBorderColor} onClick={copyLocation}>
            <img src={imgIcon} alt={imgAlt} />
          </IconButton>
          <div className="lat-long-icon">
            <LatLongIconNoShadow />
          </div>
        </>
      )}
    </div>
  );
}
