// Based on the molasses algorithm https://github.com/geoscience-community-codes/MOLASSES

import { minLat, minLong, rangeLat, rangeLong } from "./lava-constants";
import { AsciiRaster } from "./parse-ascii-raster";

const millisecondsPerFrame = 200;
const diagonalScale = 1 / Math.sqrt(2);
// The Molasses algorithm spreads for three iterations, which seems to be completely arbitrary
const pulseIterations = 3;

export interface GridCell {
  baseElevation: number;
  elevationDifference: number;
  lavaElevation: number;
  parents: Set<GridCell>;
  x: number;
  y: number;
}

function createCell(x: number, y: number, baseElevation: number) {
  return {
    baseElevation,
    elevationDifference: 0,
    lavaElevation: 0,
    parents: new Set<GridCell>(),
    x,
    y,
  };
}

function createGrid(raster: AsciiRaster) {
  const grid: GridCell[][] = [];
  raster.values.forEach((row, y) => {
    const gridRow: GridCell[] = [];
    row.forEach((baseElevation, x) => {
      gridRow.push(createCell(x, y, baseElevation));
    });
    grid.push(gridRow);
  });
  return grid;
}

function convertLongitudeToX(longitude: number, raster: AsciiRaster) {
  return Math.floor((longitude - minLong) / rangeLong * raster.header.ncols);
}

function convertLatitudeToY(latitude: number, raster: AsciiRaster) {
  return raster.header.nrows - Math.floor((latitude - minLat) / rangeLat * raster.header.nrows);
}

function getTotalElevation(cell: GridCell) {
  return cell.baseElevation + cell.lavaElevation;
}

function getLowerNeighbors(cell: GridCell, grid: GridCell[][]) {
  const neighbors: GridCell[] = [];
  [-1, 0, 1].forEach(dy => {
    [-1, 0, 1].forEach(dx => {
      if (dx === 0 && dy === 0) return; // Skip the cell itself

      const newY = cell.y + dy;
      const newX = cell.x + dx;
      // Only add the neighbor if it's within the grid bounds
      if (newY >= 0 && newY < grid.length && newX >= 0 && newX < grid[newY].length) {
        const neighbor = grid[newY][newX];
        // Do not send lava back to a cell that already sent lava to you
        if (cell.parents.has(neighbor)) return;

        const scale = (dx === 0 || dy === 0) ? 1 : diagonalScale;
        const elevationDifference = scale * (getTotalElevation(cell) - getTotalElevation(neighbor));
        // Only add the neighbor if it has a lower elevation
        if (elevationDifference > 0) {
          neighbor.elevationDifference = elevationDifference;
          neighbor.parents.add(cell);
          neighbors.push(neighbor);
        }
      }
    });
  });

  // Randomize the order of neighbors
  for (let i = neighbors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
  }

  return neighbors;
}

function getLavaElevationGrid(grid: GridCell[][]) {
  const lavaElevationGrid: number[][] = [];
  grid.forEach(row => {
    const lavaRow: number[] = [];
    row.forEach(cell => {
      lavaRow.push(cell.lavaElevation);
    });
    lavaElevationGrid.push(lavaRow);
  });
  return lavaElevationGrid;
}

export interface LavaSimulationParameters {
  postMessage: (message: any) => void;
  pulseVolume: number;
  raster: AsciiRaster;
  residual: number;
  totalVolume: number;
  ventLatitude: number;
  ventLongitude: number;
}
export async function runSimulation({
  postMessage, pulseVolume, raster, residual, totalVolume, ventLatitude, ventLongitude
}: LavaSimulationParameters) {
  const startTime = Date.now();

  // Set up simulation
  let pulseCount = 0;
  const grid = createGrid(raster);
  const ventX = convertLongitudeToX(ventLongitude, raster);
  const ventY = convertLatitudeToY(ventLatitude, raster);
  const ventCell = grid[ventY][ventX];
  const cellArea = raster.header.cellsize ** 2;
  let currentTotalVolume = totalVolume;

  const sendUpdateMessage = () => {
    postMessage({ status: "updatedGrid", grid: getLavaElevationGrid(grid), pulseCount });
  };

  let lastFrameTime = Date.now();
  while (currentTotalVolume > 0) {
    // Add lava to the vent cell
    const currentPulseVolume = Math.min(currentTotalVolume, pulseVolume);
    currentTotalVolume -= currentPulseVolume;
    const pulseHeight = currentPulseVolume / cellArea;
    ventCell.lavaElevation += pulseHeight;

    // Spread the lava
    const activeCells = [ventCell];
    const visitedCells = new Set<GridCell>();
    for (let count = 0; count < pulseIterations; count++) {
      for (const currentCell of activeCells) {
        visitedCells.add(currentCell);
        if (currentCell.lavaElevation > residual) {
          const lavaToSpread = currentCell.lavaElevation - residual;

          // Find neighbors that can receive lava
          const neighbors = getLowerNeighbors(currentCell, grid);

          // Find total amount of lava that can be transferred
          const totalElevationDifference = neighbors.reduce((sum, neighbor) => {
            return sum + neighbor.elevationDifference;
          }, 0);

          if (totalElevationDifference > 0) {
            // Transfer lava to neighbors
            neighbors.forEach(neighbor => {
              const elevationPercent = neighbor.elevationDifference / totalElevationDifference;
              const lavaToTransfer = elevationPercent * lavaToSpread;
              currentCell.lavaElevation -= lavaToTransfer;
              // Only actually spread the lava to land above sea level.
              // If we're at or below sea level, remove the lava from the simulation.
              if (neighbor.baseElevation > 0) neighbor.lavaElevation += lavaToTransfer;

              if (!visitedCells.has(neighbor) && neighbor.lavaElevation > residual) {
                activeCells.push(neighbor);
              }
            });
          }
        }
      }
    }

    pulseCount++;
    if (Date.now() - lastFrameTime >= millisecondsPerFrame) {
      sendUpdateMessage();
      lastFrameTime = Date.now();
    }
  }

  // Send a final update
  sendUpdateMessage();

  const endTime = Date.now();
  // eslint-disable-next-line no-console
  console.log(`  - Simulation completed in ${endTime - startTime} ms`);
}
