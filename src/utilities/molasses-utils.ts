import { AsciiRaster } from "../components/lava-coder/parse-ascii-raster";
import { minLat, minLong, rangeLat, rangeLong } from "../components/lava-coder/lava-constants";

export function convertLongitudeToX(longitude: number, raster: AsciiRaster) {
  return Math.floor((longitude - minLong) / rangeLong * raster.header.ncols);
}

export function convertLatitudeToY(latitude: number, raster: AsciiRaster) {
  return raster.header.nrows - Math.floor((latitude - minLat) / rangeLat * raster.header.nrows);
}

export function isPointOnIsland(latitude: number, longitude: number, raster: AsciiRaster): boolean {
  const x = convertLongitudeToX(longitude, raster);
  const y = convertLatitudeToY(latitude, raster);
  if (x < 0 || x >= raster.header.ncols || y < 0 || y >= raster.header.nrows) return false;
  return raster.values[y][x] > 0;
}
