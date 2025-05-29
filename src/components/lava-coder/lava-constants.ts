export const kFeetPerMeter = 3.28084;
export const kMetersPerFoot = 1 / kFeetPerMeter;

// Default eruption values
// These values are hardcoded in full-toolbox.xml and possibly other toolboxes and should be kept in sync
export const defaultEruptionVolume = 200000000;
export const defaultResidual = 5;
export const defaultVentLatitude = 19.5;
export const defaultVentLongitude = -155.565;

// Bounds of the elevation map in latitude and longitude
export const minLong = -156;
export const maxLong = -154.80533185226327;
export const rangeLong = maxLong - minLong;
export const minLat = 18.90863649;
export const maxLat = 20.26825881713135;
export const rangeLat = maxLat - minLat;
