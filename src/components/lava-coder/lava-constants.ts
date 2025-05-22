export const useLargeMap = true;

export const kFeetPerMeter = 3.28084;
export const kMetersPerFoot = 1 / kFeetPerMeter;

// Default eruption values
// These values are hardcoded in full-toolbox.xml and possibly other toolboxes and should be kept in sync
export const defaultEruptionVolume = 200000000;
export const defaultResidual = 5;
export const defaultVentLatitude = 19.5;
export const defaultVentLongitude = -155.565;

export const minEruptionVolume = 1000000;
export const maxEruptionVolume = 10000000000;

export const minResidual = 2;
export const maxResidual = 50;
export const rangeResidual = maxResidual - minResidual;

// Bounds of the elevation map in latitude and longitude
// Larger map from Leslie
export let minLong = -156;
export let rangeLong = 1;
export let maxLong = minLong + rangeLong;
export let minLat = 19;
export let rangeLat = 1;
export let maxLat = minLat + rangeLat;
// Smaller map from Lis
if (!useLargeMap) {
  maxLong = -155.008440;
  minLong = -155.673766;
  rangeLong = maxLong - minLong;
  minLat = 19.370473;
  maxLat = 19.819655;
  rangeLat = maxLat - minLat;
}
