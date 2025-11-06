// TODO: Remove this when use-vog-overlay.ts is removed.

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

export function visualizeVog(grid: number[][]) {
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  if (!grid.length || !grid[0].length) {
    throw new Error("Grid is empty or malformed");
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const width = grid[0].length;
  const height = grid.length;
  canvas.width = width;
  canvas.height = height;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height && y < grid.length; y++) {
    for (let x = 0; x < width && x < grid[y].length; x++) {
      const vogConcentration = grid[y][x];
      const index = (y * width + x) * 4;
      if (vogConcentration > 0) {
        // 50-100% opacity based on concentration
        data[index] = 200;
        data[index + 1] = 200;
        data[index + 2] = 200;
        data[index + 3] = 50 + Math.floor(205 * Math.min(vogConcentration, 10) / 10); // Alpha
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
