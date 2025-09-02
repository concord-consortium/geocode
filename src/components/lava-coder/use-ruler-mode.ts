import {
  CallbackPositionProperty, CallbackProperty, Cartesian2, Cartesian3, CesiumWidget, Color, Entity
} from "@cesium/engine";
import { useCallback, useEffect, useRef, useState } from "react";
import PointIcon from "../../assets/lava-coder/point-icon.asset.svg";
import PointIconActive from "../../assets/lava-coder/point-icon-active.asset.svg";
import PointIconHover from "../../assets/lava-coder/point-icon-hover.asset.svg";
import { uiStore } from "../../stores/ui-store";
import { getCameraState } from "./cesium-utils";
import { CartographicEventCallback } from "./lava-coder-types";
import { kInitialCameraPitch, kMinCameraPitch } from "./use-camera-controls";

interface IProps {
  viewer: CesiumWidget | null;
  verticalExaggeration: number;
  animateToCameraPitch: (pitch: number, exaggeration: number) => void;
  listenToCameraChange: (callback: () => void) => (() => void);
  setCursor: (cursor: string) => void
}

const kFirstPointId = "rulerFirstPoint";
const kSecondPointId = "rulerSecondPoint";
type RulerPointId = typeof kFirstPointId | typeof kSecondPointId;
const isRulerPointId = (id?: string): id is RulerPointId => id === kFirstPointId || id === kSecondPointId;
const kConnectingLineId = "rulerConnectingLine";

export function useRulerMode({
  viewer, verticalExaggeration, animateToCameraPitch, listenToCameraChange, setCursor
}: IProps) {
  const initialRulerModePitch = useRef<number | null>(null);
  const [isRulerMode, setIsRulerMode] = useState(false);
  const [ , setChangeCount] = useState(0);
  const firstPointStatic = useRef<Cartesian3 | null>(null);
  const secondPointCursor = useRef<Cartesian3 | null>(null);
  const secondPointStatic = useRef<Cartesian3 | null>(null);
  const firstPointEntity = useRef<Entity | null>(null);
  const secondPointEntity = useRef<Entity | null>(null);
  const connectingLineEntity = useRef<Entity | null>(null);
  const hoverPoint = useRef<RulerPointId | null>(null);
  const dragPoint = useRef<RulerPointId | null>(null);

  const getFirstPoint = useCallback(() => {
    return firstPointStatic.current;
  }, []);

  const getSecondPoint = useCallback(() => {
    return secondPointStatic.current || secondPointCursor.current;
  }, []);

  function toggleRulerMode() {
    setIsRulerMode(prev => !prev);
  }

  // animate to top view when entering ruler mode and animate back to original pitch when exiting
  useEffect(() => {
    if (isRulerMode) {
      const { initialPitch } = getCameraState(viewer) || {};
      initialRulerModePitch.current = initialPitch ?? kInitialCameraPitch;
      // switch to overhead view and flatten the vertical exaggeration
      animateToCameraPitch(kMinCameraPitch, 1);
    }
    else if (!isRulerMode) {
      // restore the original pitch and vertical exaggeration
      animateToCameraPitch(initialRulerModePitch.current ?? kInitialCameraPitch, uiStore.verticalExaggeration);
      initialRulerModePitch.current = null;
      firstPointStatic.current = null;
      secondPointCursor.current = null;
      secondPointStatic.current = null;
    }
  }, [animateToCameraPitch, isRulerMode, viewer]);

  const getCursor = useCallback((position: Cartesian2) => {
    if (isRulerMode) {
      if (!firstPointStatic.current) return "crosshair";
      // "cursor" is rendered as cesium entity until second point is placed
      if (!secondPointStatic.current) return "none";
      // pointer cursor when over ruler points
      const picked = viewer?.scene.pick(position);
      const pickedId = picked?.id;
      if (pickedId instanceof Entity) {
        if (isRulerPointId(pickedId.id)) {
          hoverPoint.current = pickedId.id as RulerPointId;
          return "pointer";
        }
      }
      hoverPoint.current = null;
    }
    return "auto";
  }, [isRulerMode, viewer]);

  // second point follows cursor if second point not set
  const handleMouseMove: CartographicEventCallback = useCallback(({ latitude, longitude, elevation }) => {
    elevation /= verticalExaggeration; // Adjust elevation for vertical exaggeration
    if (firstPointStatic.current && !secondPointStatic.current) {
      // second point follows cursor if second point not set
      secondPointCursor.current = Cartesian3.fromDegrees(longitude, latitude, elevation);
      setChangeCount(prev => prev + 1);
    }
  }, [verticalExaggeration]);

  // clicks set ruler point positions
  const handleClick: CartographicEventCallback = useCallback(({ latitude, longitude, elevation, position }) => {
    elevation /= verticalExaggeration; // Adjust elevation for vertical exaggeration
    if (!firstPointStatic.current) {
      firstPointStatic.current = secondPointCursor.current =
        Cartesian3.fromDegrees(longitude, latitude, elevation);
      setChangeCount(prev => prev + 1);
    } else if (!secondPointStatic.current) {
      secondPointStatic.current = Cartesian3.fromDegrees(longitude, latitude, elevation);
      setChangeCount(prev => prev + 1);
    }
  }, [verticalExaggeration]);

  // create/destroy cesium entity for first point
  useEffect(() => {
    if (!viewer) return;

    if (getFirstPoint() && !firstPointEntity.current) {
      const image = new CallbackProperty(() => {
        return dragPoint.current === kFirstPointId
                ? PointIconActive
                : hoverPoint.current === kFirstPointId
                  ? PointIconHover
                  : PointIcon;
      }, false);
      firstPointEntity.current = viewer.entities.add({
        id: kFirstPointId,
        position: new CallbackPositionProperty(() => getFirstPoint()!, false),
        billboard: {
          image,
          // place points above the connecting line
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
    }
    else if (!firstPointStatic.current && firstPointEntity.current) {
      viewer.entities.remove(firstPointEntity.current);
      firstPointEntity.current = null;
    }
  });

  // create/destroy cesium entity for second point
  useEffect(() => {
    if (!viewer) return;

    if (getSecondPoint() && !secondPointEntity.current) {
      const image = new CallbackProperty(() => {
        return dragPoint.current === kSecondPointId
                ? PointIconActive
                : hoverPoint.current === kSecondPointId
                  ? PointIconHover
                  : PointIcon;
      }, false);
      secondPointEntity.current = viewer.entities.add({
        id: kSecondPointId,
        position: new CallbackPositionProperty(() => getSecondPoint()!, false),
        billboard: {
          image,
          // place points above the connecting line
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
    }
    else if (!getSecondPoint() && secondPointEntity.current) {
      viewer.entities.remove(secondPointEntity.current);
      secondPointEntity.current = null;
    }
  });

  // create/destroy cesium entity for connecting line
  useEffect(() => {
    if (!viewer) return;

    if (getFirstPoint() && getSecondPoint() && !connectingLineEntity.current) {
      connectingLineEntity.current = viewer.entities.add({
        id: kConnectingLineId,
        polyline: {
          positions: new CallbackProperty(() => [getFirstPoint()!, getSecondPoint()!], false),
          width: 3,
          material: Color.fromCssColorString("#b263f7")
        }
      });
    }
    else if ((!getFirstPoint() || !getSecondPoint()) && connectingLineEntity.current) {
      viewer.entities.remove(connectingLineEntity.current);
      connectingLineEntity.current = null;
    }
  });

  // camera changes trigger re-renders
  useEffect(() => {
    return listenToCameraChange(() => setChangeCount(c => c + 1));
  }, [listenToCameraChange]);

  // update coordinates of connecting line
  useEffect(() => {
    const point1 = firstPointStatic.current;
    const point2 = secondPointStatic.current || secondPointCursor.current;
    if (!viewer || !point1 || !point2) {
      uiStore.setRulerLine(undefined);
      return;
    }

    uiStore.setRulerLine({
      points: [
        viewer.scene.cartesianToCanvasCoordinates(point1),
        viewer.scene.cartesianToCanvasCoordinates(point2)
      ],
      distance: Cartesian3.distance(point1, point2)
    });
  });

  // Support dragging of points on the map. Implementation note: I originally implemented dragging
  // using cesium event handlers, but point dragging interacted poorly with map panning, so I
  // switched to an implementation based on browser pointer events and capturing the pointer.
  // I believe it would have been possible to implement dragging using cesium's built-in events
  // by disabling our event handlers in `useCameraControls()`, but I opted to keep this approach.
  useEffect(() => {
    if (!viewer) return;

    const canvas = viewer.scene.canvas;
    let pointerId = 0;

    function handlePointerMove(event: PointerEvent) {
      event.stopImmediatePropagation();
      event.preventDefault();

      if (viewer && dragPoint.current) {
        // Get the mouse position relative to the canvas
        const rect = viewer.scene.canvas.getBoundingClientRect();
        const dragPos = new Cartesian2(event.clientX - rect.left, event.clientY - rect.top);
        const cartesian = viewer.scene.pickPosition(dragPos);
        if (cartesian) {
          if (dragPoint.current === kFirstPointId) {
            firstPointStatic.current = cartesian;
          } else if (dragPoint.current === kSecondPointId) {
            secondPointStatic.current = cartesian;
          }
          setChangeCount(count => count + 1);
        }
      }
    }

    function handlePointerUp(event: PointerEvent) {
      event.stopImmediatePropagation();
      event.preventDefault();

      if (dragPoint.current) {
        canvas.releasePointerCapture(pointerId);

        canvas.removeEventListener("pointermove", handlePointerMove, { capture: true });
        canvas.removeEventListener("pointerup", handlePointerUp, { capture: true });

        dragPoint.current = null;

        setCursor("pointer");
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (!viewer) return;

      if (!firstPointStatic.current || !secondPointStatic.current) return;

      pointerId = event.pointerId;

      // Get the mouse position relative to the canvas
      const rect = viewer.scene.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Use scene.pick to get the picked object
      const pickedObject = viewer.scene.pick(new Cartesian2(x, y));
      if (pickedObject?.id && isRulerPointId(pickedObject.id?.id)) {
        event.stopImmediatePropagation();
        event.preventDefault();

        dragPoint.current = pickedObject.id.id as RulerPointId;

        setCursor("grabbing");

        canvas.setPointerCapture(pointerId);

        canvas.addEventListener("pointermove", handlePointerMove, { capture: true });
        canvas.addEventListener("pointerup", handlePointerUp, { capture: true });
      }
    }

    canvas.addEventListener("pointerdown", handlePointerDown, { capture: true });
  }, [setCursor, viewer]);

  return { isRulerMode, getCursor, handleClick, handleMouseMove, toggleRulerMode };
}
