import { WindPattern } from "./lava-coder-types";

export const kFeetPerMeter = 3.28084;
export const kMetersPerFoot = 1 / kFeetPerMeter;
export const kMetersPerMile = 1609.344;
export const kSquareMetersPerAcre = 4046.86;

// Default eruption values
// These values are hardcoded in full-toolbox.xml and possibly other toolboxes and should be kept in sync
export const defaultEruptionVolume = 200000000;
export const defaultResidual = 5;
export const defaultShowWindPattern = false;
export const defaultVentLatitude = 19.5;
export const defaultVentLongitude = -155.565;
export const defaultWindPattern = "trade" as WindPattern;

// Bounds of the elevation map in latitude and longitude
export const minLong = -156;
export const maxLong = -154.80533185226327;
export const rangeLong = maxLong - minLong;
export const minLat = 18.90863649;
export const maxLat = 20.26825881713135;
export const rangeLat = maxLat - minLat;

// Flag location constants
export const maxFlags = 4;
export const flagColors = ["green", "blue", "orange", "purple"] as const;
export type FlagColor = typeof flagColors[number];
export const flagColorInfo: Record<string, { color: string }> = {
  [flagColors[0]]: { color: "#80e62e" },
  [flagColors[1]]: { color: "#22c7ff" },
  [flagColors[2]]: { color: "#fb8d34" },
  [flagColors[3]]: { color: "#e270e6" },
};
export const flagLabels = ["A", "B", "C", "D"];
// Used to center the labels
export const flagLabelInfo = {
  [flagLabels[0]]: { xOffset: .5, yOffset: -22 },
  [flagLabels[1]]: { xOffset: 2, yOffset: -21 },
  [flagLabels[2]]: { xOffset: 0, yOffset: -21 },
  [flagLabels[3]]: { xOffset: 1.5, yOffset: -21 },
};
