import { AsciiRaster } from "./parse-ascii-raster";
import { GridCell, residual } from "./molasses";

export function visualizeLava(raster: AsciiRaster, grid: GridCell[][]) {
  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = "30px";
  canvas.style.left = "350px";
  canvas.style.zIndex = "9999";
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  const width = raster.header.ncols;
  const height = raster.header.nrows;
  canvas.width = width;
  canvas.height = height;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      const index = (y * width + x) * 4;
      data[index] = 150; // Red
      data[index + 1] = 150; // Green
      data[index + 2] = 255; // Blue
      if (cell.lavaElevation > 0) {
        if (cell.lavaElevation <= residual) {
          data[index] = 255 * cell.lavaElevation / residual;
          data[index + 1] = 0;
          data[index + 2] = 0;
        } else {
          const value = 255 * Math.min(1, (cell.lavaElevation - residual) / (residual));
          data[index] = 255;
          data[index + 1] = value;
          data[index + 2] = 0;
        }
      }
      data[index + 3] = 255; // Alpha
    }
  }

  ctx.putImageData(imageData, 0, 0);
  document.body.appendChild(canvas);

  return () => {
    document.body.removeChild(canvas);
  };
}
