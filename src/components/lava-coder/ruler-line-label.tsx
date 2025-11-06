import { CesiumWidget } from "@cesium/engine";
import { observer } from "mobx-react";
import { useRef } from "react";
import { kMetersPerMile } from "../../simulations/lava-coder/lava-constants";
import { uiStore } from "../../stores/ui-store";

import "./ruler-line-label.scss";

interface IProps {
  viewer: CesiumWidget | null;
  listenToCameraChange: (callback: () => void) => (() => void);
}

export const RulerLineLabel = observer(function RulerLineLabel({ viewer, listenToCameraChange }: IProps) {
  const labelRef = useRef<HTMLDivElement>(null);
  const { rulerLine } = uiStore;

  if (!rulerLine) return null;

  const kDefaultLabelHeight = 25;
  const bounds = labelRef.current?.getBoundingClientRect();

  const [point1, point2] = rulerLine.points;
  const distanceMiles = rulerLine.distance / kMetersPerMile;
  const midPoint = {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
  };
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  const kOffset = 3;
  // default to right of midPoint (e.g. no line or vertical line)
  let left = midPoint.x + 2 * kOffset;
  let top = midPoint.y - (kDefaultLabelHeight / 2);

  if (Math.abs(dx) > 0 && bounds) {
    if (dy === 0) {
      // horizontal line -- label is underneath
      left = midPoint.x - (bounds.width / 2);
      top = midPoint.y + kOffset;
    }
    // adjust the position so one corner of the label is kOffset pixels from
    // the midpoint of the line along the normal vector
    else {
      // Perpendicular vector (normal): (-dy, dx)
      const perpX = -dy / length;
      const perpY = dx / length;
      if (dx > 0 && dy > 0) {
        // line going down to right -- place lower-left corner
        left = midPoint.x + perpX * -kOffset;
        top = midPoint.y + perpY * -kOffset - bounds.height;
      }
      else if (dx > 0 && dy < 0) {
        // line going up to right -- place upper-left corner
        left = midPoint.x + perpX * kOffset;
        top = midPoint.y + perpY * kOffset;
      }
      else if (dx < 0 && dy > 0) {
        // line going down to left -- place upper-left corner
        left = midPoint.x + perpX * -kOffset;
        top = midPoint.y + perpY * -kOffset;
      }
      else {
        // line going up to left -- place lower-left corner
        left = midPoint.x + perpX * kOffset;
        top = midPoint.y + perpY * kOffset - bounds.height;
      }
    }
  }

  return (
    <div ref={labelRef} className="ruler-line-label" style={{ left, top }}>
      {`${distanceMiles.toFixed(2)} mi`}
    </div>
  );
});
