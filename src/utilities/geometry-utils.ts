import { Cartesian3, Cartographic, Ellipsoid } from "@cesium/engine";

// Convert array of Cartesian3 to Cartographic
function cartesianArrayToCartographic(positions: Cartesian3[]): Cartographic[] {
  return positions.map(pos => Cartographic.fromCartesian(pos, Ellipsoid.WGS84));
}

export function pointInPolygon(lat: number, lon: number, positions: Cartesian3[]): boolean {
  // Convert positions to [lon, lat] pairs
  const cartographicPositions = cartesianArrayToCartographic(positions);
  const polygon = cartographicPositions.map(pos => [pos.longitude, pos.latitude]);
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lon < (xj - xi) * (lat - yi) / (yj - yi + Number.EPSILON) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
