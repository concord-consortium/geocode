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
  const values = lines.slice(dataStartIndex).map(line =>
    line.trim().split(/\s+/).map(Number)
  );

  return {
    header,
    values,
  };
}
