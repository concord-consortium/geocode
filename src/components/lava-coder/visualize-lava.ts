import { lavaSimulation } from "../../stores/lava-simulation-store";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

export function visualizeLava(grid: number[][]) {
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  if (!grid.length || !grid[0].length) {
    throw new Error("Grid is empty or malformed");
  }

  const { residual } = lavaSimulation;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const width = grid[0].length;
  const height = grid.length;
  canvas.width = width;
  canvas.height = height;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height && y < grid.length; y++) {
    for (let x = 0; x < width && x < grid[y].length; x++) {
      const lavaElevation = grid[y][x];
      const index = (y * width + x) * 4;
      if (lavaElevation > 0) {
        // Black -> Red up to residual, Red -> Yellow up to 2 * residual or greater
        data[index] = 255 * lavaElevation / residual;
        data[index + 1] = 255 * Math.max(0, Math.min(1, (lavaElevation - residual) / residual));
        data[index + 2] = 0;
        data[index + 3] = 255; // Alpha
      } else {
        // Transparent
        data[index] = 255; // Red
        data[index + 1] = 255; // Green
        data[index + 2] = 255; // Blue
        data[index + 3] = 0; // Alpha
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}
