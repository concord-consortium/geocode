import {rotate, translate, applyToPoints, transform, applyToPoint } from "transformation-matrix";
interface Ipoint {
  x: number;
  y: number;
}

export const makeRotMatrix = (angleDeg: number, center: Ipoint) => {
  const angleRad = (angleDeg / 360) * 2 * Math.PI;
  return transform(
    translate(center.x, center.y),
    rotate(angleRad),
    translate(-center.x, -center.y),
  );
};

export const rotateGridPoints = (
  data: Ipoint[],
  angleDeg: number,
  center: Ipoint) => {
    const m = makeRotMatrix(angleDeg, center);
    return applyToPoints(m, data);
};

export const rotateGridPoint = (
  point: Ipoint,
  angleDeg: number,
  center: Ipoint) => {
    const m = makeRotMatrix(angleDeg, center);
    return applyToPoint(m, point);
  };
