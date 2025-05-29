import { useLargeMap } from './lava-options';

export const kFeetPerMeter = 3.28084;
export const kMetersPerFoot = 1 / kFeetPerMeter;

// Default eruption values
// These values are hardcoded in full-toolbox.xml and possibly other toolboxes and should be kept in sync
export const defaultEruptionVolume = 200000000;
export const defaultResidual = 5;
export const defaultVentLatitude = 19.5;
export const defaultVentLongitude = -155.565;

// Bounds of the elevation map in latitude and longitude
// Larger map comprised of multiple maps from Leslie
export let minLong = -156;
export let maxLong = -154.80533185226327;
export let rangeLong = maxLong - minLong;
export let minLat = 18.90863649;
export let maxLat = 20.26825881713135;
export let rangeLat = maxLat - minLat;
// Smaller map from Lis
if (!useLargeMap) {
  maxLong = -155.008440;
  minLong = -155.673766;
  rangeLong = maxLong - minLong;
  minLat = 19.370473;
  maxLat = 19.819655;
  rangeLat = maxLat - minLat;
}
