import { lavaSimulation } from "../../stores/lava-simulation-store";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// How many cells in from the flow's edge get drawn as outline, in the gray rendering. One cell
// is roughly 60m, which is close to invisible once the island is zoomed out.
const kGrayOutlineCells = 2;
const kGrayOutlineValue = 43; // near-black, so overlapping gray runs stay distinguishable

/**
 * Renders a lava elevation grid to a PNG data URL.
 * `thickness` defaults to the simulation's current thickness, but a completed run must pass
 * its own — the colour ramp is scaled by it, so replaying an old run with the current value
 * would render it with the wrong colours.
 *
 * `gray` renders the flow as neutral grays instead of the black/red/yellow ramp, for earlier
 * runs left on the map behind the one being displayed. The lightness still tracks depth, so
 * the shape stays readable, but it can't be mistaken for the active flow.
 */
export function visualizeLava(grid: number[][], thickness?: number, gray = false) {
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  if (!grid.length || !grid[0].length) {
    throw new Error("Grid is empty or malformed");
  }

  const residual = thickness ?? lavaSimulation.residual;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const width = grid[0].length;
  const height = grid.length;

  const hasLava = (y: number, x: number) =>
    y >= 0 && y < height && !!grid[y] && x >= 0 && x < grid[y].length && grid[y][x] > 0;
  // A lava cell with any empty cell (or the grid edge) within kGrayOutlineCells of it. Only
  // used for the gray rendering, so the live colour path pays nothing for it.
  const nearEdge = (y: number, x: number) => {
    for (let dy = -kGrayOutlineCells; dy <= kGrayOutlineCells; dy++) {
      for (let dx = -kGrayOutlineCells; dx <= kGrayOutlineCells; dx++) {
        if (!hasLava(y + dy, x + dx)) return true;
      }
    }
    return false;
  };
  canvas.width = width;
  canvas.height = height;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height && y < grid.length; y++) {
    for (let x = 0; x < width && x < grid[y].length; x++) {
      const lavaElevation = grid[y][x];
      const index = (y * width + x) * 4;
      if (lavaElevation > 0) {
        if (gray) {
          // Dark -> light gray across the same depth range the colour ramp spans, with a
          // near-black band around the edge so overlapping past runs stay readable.
          const depth = Math.max(0, Math.min(1, lavaElevation / (2 * residual)));
          const value = nearEdge(y, x) ? kGrayOutlineValue : Math.round(90 + 110 * depth);
          data[index] = value;
          data[index + 1] = value;
          data[index + 2] = value;
          data[index + 3] = 255; // Alpha
        } else {
          // Black -> Red up to residual, Red -> Yellow up to 2 * residual or greater
          data[index] = 255 * lavaElevation / residual;
          data[index + 1] = 255 * Math.max(0, Math.min(1, (lavaElevation - residual) / residual));
          data[index + 2] = 0;
          data[index + 3] = 255; // Alpha
        }
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
