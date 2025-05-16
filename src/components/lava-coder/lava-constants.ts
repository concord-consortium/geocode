export const kFeetPerMeter = 3.28084;
export const kMetersPerFoot = 1 / kFeetPerMeter;

// Default eruption values
// These values are hardcoded in full-toolbox.xml and possibly other toolboxes and should be kept in sync
export const defaultEruptionVolume = 200000000;
export const defaultPulseVolume = 100000;
export const defaultResidual = 5;
export const defaultVentLatitude = 19.5;
export const defaultVentLongitude = -155.565;

export const minEruptionVolume = 1000000;
export const maxEruptionVolume = 10000000000;

export const minResidual = 2;
export const maxResidual = 50;
export const rangeResidual = maxResidual - minResidual;

// Bounds of the elevation map in latitude and longitude
export const maxLong = -155.008440;
export const minLong = -155.673766;
export const rangeLong = maxLong - minLong;
export const minLat = 19.370473;
export const maxLat = 19.819655;
export const rangeLat = maxLat - minLat;
