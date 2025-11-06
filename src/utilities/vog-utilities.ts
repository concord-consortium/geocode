import konaWindData from "../assets/lava-coder/wind-patterns/kona-winds.json";
import tradeWindData from "../assets/lava-coder/wind-patterns/trade-winds.json";
import { WindPattern } from "../types/lava-coder/lava-coder-types";

interface WindData {
  columns: number;
  data: {
    lats: number[];
    lons: number[];
    grid: number[][][];
  };
  maxLat: number;
  maxLon: number;
  midLat: number;
  midLon: number;
  minLat: number;
  minLon: number;
  rangeLat: number;
  rangeLon: number;
  stepLat: number;
  stepLon: number;
  rows: number;
}

const windData: Record<string, WindData> = {};

function setupWindData(windPattern: WindPattern) {
  const data = windPattern === "trade" ? tradeWindData : konaWindData;
  const columns = data.lats.length;
  const rows = data.lons.length;
  const minLat = data.lats[0];
  const maxLat = data.lats[data.lats.length - 1];
  const minLon = data.lons[0];
  const maxLon = data.lons[data.lons.length - 1];
  const rangeLat = maxLat - minLat;
  const rangeLon = maxLon - minLon;

  windData[windPattern] = {
    columns,
    data,
    minLat,
    maxLat,
    midLat: (minLat + maxLat) / 2,
    minLon,
    maxLon,
    midLon: (minLon + maxLon) / 2,
    rangeLat,
    rangeLon,
    stepLat: rangeLat / (columns - 1),
    stepLon: rangeLon / (rows - 1),
    rows
  };
}

setupWindData("trade");
setupWindData("kona");

export function getWindData(windPattern: WindPattern) {
  return windData[windPattern];
}
