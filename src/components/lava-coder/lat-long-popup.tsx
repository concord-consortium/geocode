import { Cartesian2, Cartesian3, Cartographic, CesiumWidget } from "@cesium/engine";
import { clsx } from "clsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CopiedButtonIcon from "../../assets/lava-coder/content-copied-icon.png";
import CopyButtonIcon from "../../assets/lava-coder/content-copy-icon.png";
import LatLongIconNoShadow from "../../assets/lava-coder/lat-long-icon-no-shadow.svg";
import { uiStore } from "../../stores/ui-store";
import IconButton from "../buttons/icon-button";
import { ILatLong, ILatLongElevation } from "./lava-coder-types";

import "./lat-long-popup.scss";

interface IProps {
  viewer: CesiumWidget | null;
  verticalExaggeration: number;
  // static shows location stored in uiStore, dynamic shows location under cursor
  mode?: "static" | "dynamic";
  onSetLatLongPoint: (latLong: ILatLongElevation) => void;
}

const kWidthWithCopy = 168;
const kWidthWithoutCopy = 125;
const kPopupHeight = 42;
// The vertical offset of the popup from the bottom of the marker
const kBorderColor = "#3baa1d";

function degToStr(value: number) {
  return `${value.toFixed(3)}`;
}

export function LatLongPopup({ viewer, verticalExaggeration, mode, onSetLatLongPoint }: IProps) {
  const isDragging = useRef(false);
  // screen position of the lat/long point (bottom-left of popup)
  const screenPos = useRef<Cartesian2 | undefined>();
  const [cursorPos, setCursorPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  // lat/long coordinates under the cursor in dynamic mode or when dragging
  const [dynamicLatLong, setDynamicLatLong] = useState<ILatLong | null>(null);
  const [copiedLatLong, setCopiedLatLong] = useState<ILatLong | null>(null);
  const [hideCopyButton, setHideCopyButton] = useState(false);
  const [hover, setHover] = useState(false);
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
    if (mode === "dynamic") {
      setHideCopyButton(true);
    }
  }, [mode]);

  // returns false if the point is over the copy button
  const isOverDragArea = useCallback((e: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
    const popupRect = popupRef.current?.getBoundingClientRect();
    if (!popupRect) return false;
    return e.clientX - popupRect.left < kWidthWithoutCopy;
  }, []);

  const setLatLongFromScreenPos = useCallback((onSetLatLong?: (latLong: ILatLongElevation) => void) => {
    if (!screenPos.current || !viewer) return;

    // Get the pick ray and intersection with the globe
    const scene = viewer.scene;
    const ray = scene.camera.getPickRay(screenPos.current);
    const pickedPosition = ray ? scene.globe.pick(ray, scene) : null;

    if (pickedPosition) {
      const cartPos = Cartographic.fromCartesian(pickedPosition);
      const latLong: ILatLongElevation = {
        latitude: cartPos.latitude * 180 / Math.PI,
        longitude: cartPos.longitude * 180 / Math.PI,
        elevation: cartPos.height / verticalExaggeration
      };
      setDynamicLatLong(latLong);
      onSetLatLong?.(latLong);
    }
  }, [verticalExaggeration, viewer]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const containerElt = viewer?.container;
      if (!containerElt) return;
      const { left: containerX, top: containerY } = containerElt.getBoundingClientRect();
      const x = event.clientX - containerX;
      const y = event.clientY - containerY;
      setCursorPos({ x, y });

      // Convert screen position to Cesium Cartesian2
      screenPos.current = new Cartesian2(x, y);

      // update the lat/long under the cursor
      setLatLongFromScreenPos();
    }

    window.addEventListener("pointermove", handlePointerMove, true);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove, true);
    };
  }, [setLatLongFromScreenPos, viewer]);

  if (!mode || (mode === "dynamic" && !dynamicLatLong)) return null;

  const isDynamicOrDragging = mode === "dynamic" || isDragging.current;
  const latitude = isDynamicOrDragging ? dynamicLatLong?.latitude : uiStore.pointLatitude;
  const longitude = isDynamicOrDragging ? dynamicLatLong?.longitude : uiStore.pointLongitude;
  const elevation = isDynamicOrDragging ? 0 : uiStore.pointElevation; // Elevation is not used in dynamic mode
  if (latitude == null || longitude == null || elevation == null) return null;

  let popupLeft = cursorPos.x - 1;
  let popupTop = cursorPos.y - kPopupHeight - 4;

  if (mode === "static") {
    if (!isDragging.current) {
      const cartesian = Cartesian3.fromDegrees(longitude, latitude, elevation * verticalExaggeration);
      const scene = viewer?.scene;
      screenPos.current = scene?.cartesianToCanvasCoordinates(cartesian);
    }
    if (!screenPos.current) return null;
    popupLeft = screenPos.current.x;
    popupTop = screenPos.current.y - kPopupHeight;
  }

  const popupStyle: React.CSSProperties = {
    left: popupLeft,
    top: popupTop,
    width: isDynamicOrDragging ? kWidthWithoutCopy : kWidthWithCopy,
    height: kPopupHeight
  };

  function handlePointerOver(e: React.PointerEvent<HTMLDivElement>) {
    setHover(isOverDragArea(e));
  }

  function handlePointerOut() {
    setHover(false);
  }

  function handlePointerDown(downEvt: React.PointerEvent<HTMLDivElement>) {
    if (!screenPos.current || !isOverDragArea(downEvt)) return;

    downEvt.preventDefault();
    downEvt.stopPropagation();

    const downX = downEvt.clientX;
    const downY = downEvt.clientY;
    const initialX = screenPos.current.x;
    const initialY = screenPos.current.y;

    function handlePointerMove(e: PointerEvent) {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (!screenPos.current) return;

      isDragging.current = true;

      const dx = e.clientX - downX;
      const dy = e.clientY - downY;

      screenPos.current.x = initialX + dx;
      screenPos.current.y = initialY + dy;
      setLatLongFromScreenPos();
    }

    function handlePointerUp(e: PointerEvent) {
      e.preventDefault();
      e.stopImmediatePropagation();

      setLatLongFromScreenPos(onSetLatLongPoint);
      isDragging.current = false;
      // hide the copy button until the width transition ends
      setHideCopyButton(true);

      window.removeEventListener("pointermove", handlePointerMove, true);
      window.removeEventListener("pointerup", handlePointerUp, true);
    }

    window.addEventListener("pointermove", handlePointerMove, true);
    window.addEventListener("pointerup", handlePointerUp, true);
  }

  function handleTransitionEnd() {
    // show the copy button after the transition ends
    if (hideCopyButton) {
      setHideCopyButton(false);
    }
  }

  function copyLocation() {
    if (latitude == null || longitude == null) return;
    // Copy the latitude and longitude to the clipboard
    const latLongStr = `${degToStr(latitude)},${degToStr(longitude)}`;
    navigator.clipboard.writeText(latLongStr)
      .then(() => setCopiedLatLong({ latitude, longitude }))
      .catch((err) => {
        console.error("Failed to copy lat/long coordinates:", err);
      });
  }

  const drag = isDragging.current;
  const isCopied = copiedLatLong?.latitude === latitude &&
                  copiedLatLong?.longitude === longitude;
  const imgIcon = isCopied ? CopiedButtonIcon : CopyButtonIcon;
  const imgAlt = isCopied ? "Copied" : "Copy";

  return (
    <div className={clsx("lat-long-popup", { hover, drag })} ref={popupRef} style={popupStyle}
          onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}
          onPointerDown={handlePointerDown} onTransitionEnd={handleTransitionEnd}>
      <div className="latitude label">Lat:</div>
      <div className="latitude value">{`${degToStr(latitude)}°`}</div>
      <div className="longitude label">Long:</div>
      <div className="longitude value">{`${degToStr(longitude)}°`}</div>
      {mode === "static" && (
        <>
          {!isDragging.current && !hideCopyButton && (
            <IconButton className="copy-button" borderColor={kBorderColor} onClick={copyLocation}>
              <img src={imgIcon} alt={imgAlt} />
            </IconButton>
          )}
          <div className={clsx("lat-long-icon", { hover, drag })} onPointerDown={handlePointerDown}>
            <LatLongIconNoShadow />
          </div>
        </>
      )}
    </div>
  );
}
