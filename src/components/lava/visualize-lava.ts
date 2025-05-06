import { AsciiRaster } from "./parse-ascii-raster";
import { residual } from "./molasses";

function containerElement() {
  return document.getElementById("lava-map") || document.body;
}

export function visualizeLava(raster: AsciiRaster, grid: number[][]) {
  const canvas = document.createElement("canvas");
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
      const lavaElevation = grid[y][x];
      const index = (y * width + x) * 4;
      data[index] = 230; // Red
      data[index + 1] = 230; // Green
      data[index + 2] = 230; // Blue
      if (lavaElevation > 0) {
        if (lavaElevation <= residual) {
          data[index] = 255 * lavaElevation / residual;
          data[index + 1] = 0;
          data[index + 2] = 0;
        } else {
          const value = 255 * Math.min(1, (lavaElevation - residual) / (residual));
          data[index] = 255;
          data[index + 1] = value;
          data[index + 2] = 0;
        }
      }
      data[index + 3] = 255; // Alpha
    }
  }

  ctx.putImageData(imageData, 0, 0);
  containerElement().appendChild(canvas);

  return () => {
    containerElement().removeChild(canvas);
  };
}
