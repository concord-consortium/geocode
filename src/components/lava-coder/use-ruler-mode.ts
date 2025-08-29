import {
  CallbackPositionProperty, CallbackProperty, Cartesian3, CesiumWidget, Color, Entity
} from "@cesium/engine";
import { useCallback, useEffect, useRef, useState } from "react";
import PointIcon from "../../assets/lava-coder/point-icon.asset.svg";
import { uiStore } from "../../stores/ui-store";
import { getCameraState } from "./cesium-utils";
import { CartographicEventCallback } from "./lava-coder-types";
import { kInitialCameraPitch, kMinCameraPitch } from "./use-camera-controls";

interface IProps {
  viewer: CesiumWidget | null;
  verticalExaggeration: number;
  animateToCameraPitch: (pitch: number, exaggeration: number) => void;
}

const kFirstPointId = "rulerFirstPoint";
const kSecondPointId = "rulerSecondPoint";
const kConnectingLineId = "rulerConnectingLine";

export function useRulerMode({ viewer, verticalExaggeration, animateToCameraPitch }: IProps) {
  const initialRulerModePitch = useRef<number | null>(null);
  const [isRulerMode, setIsRulerMode] = useState(false);
  const [ , setChangeCount] = useState(0);
  const firstPointStatic = useRef<Cartesian3 | null>(null);
  const secondPointCursor = useRef<Cartesian3 | null>(null);
  const secondPointStatic = useRef<Cartesian3 | null>(null);
  const firstPointEntity = useRef<Entity | null>(null);
  const secondPointEntity = useRef<Entity | null>(null);
  const connectingLineEntity = useRef<Entity | null>(null);

  const getFirstPoint = useCallback(() => {
    return firstPointStatic.current;
  }, []);

  const getSecondPoint = useCallback(() => {
    return secondPointStatic.current || secondPointCursor.current;
  }, []);

  function toggleRulerMode() {
    setIsRulerMode(prev => !prev);
  }

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

  const getCursor = useCallback(() => {
    if (isRulerMode) {
      if (!firstPointStatic.current) return "crosshair";
      // "cursor" is rendered as cesium entity until second point is placed
      if (!secondPointStatic.current) return "none";
    }
    return "auto";
  }, [isRulerMode]);

  const handleMouseMove: CartographicEventCallback = useCallback((latitude, longitude, elevation) => {
    elevation /= verticalExaggeration; // Adjust elevation for vertical exaggeration
    if (firstPointStatic.current && !secondPointStatic.current) {
      secondPointCursor.current = Cartesian3.fromDegrees(longitude, latitude, elevation);
      setChangeCount(prev => prev + 1);
    }
  }, [verticalExaggeration]);

  const handleClick: CartographicEventCallback = useCallback((latitude, longitude, elevation) => {
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

  useEffect(() => {
    if (!viewer) return;

    if (getFirstPoint() && !firstPointEntity.current) {
      firstPointEntity.current = viewer.entities.add({
        id: kFirstPointId,
        position: new CallbackPositionProperty(() => getFirstPoint()!, false),
        billboard: {
          image: PointIcon,
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

  useEffect(() => {
    if (!viewer) return;

    if (getSecondPoint() && !secondPointEntity.current) {
      secondPointEntity.current = viewer.entities.add({
        id: kSecondPointId,
        position: new CallbackPositionProperty(() => getSecondPoint()!, false),
        billboard: {
          image: PointIcon,
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

  return { isRulerMode, getCursor, handleClick, handleMouseMove, toggleRulerMode };
}
