// Based on a suggestion from ChatGPT
import { kFeetPerMeter } from "./lava-constants";

// The elevation data is in meters, which we should technically use.
// However, the project team liked how the model runs when using feet, which has the effect of channeling the lava.
// Setting this flag to true converts the elevation unit from meters to feet.
const USE_INCORRECT_ELEVATION_UNITS = true;

export interface AsciiRaster {
  header: Record<string, number>;
  values: number[][];
}

export function parseAsciiRaster(content: string) {
  const lines = content.trim().split('\n');
  const header: Record<string, number> = {};
  let dataStartIndex = 0;

  // Parse header
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length === 2) {
      header[parts[0].toLowerCase()] = parseFloat(parts[1]);
    } else {
      dataStartIndex = i;
      break;
    }
  }

  // Parse raster values
  const scale = USE_INCORRECT_ELEVATION_UNITS ? kFeetPerMeter : 1;
  const values = lines.slice(dataStartIndex).map(line =>
    line.trim().split(/\s+/).map(value => Number(value) * scale)
  );

  return {
    header,
    values,
  };
}
