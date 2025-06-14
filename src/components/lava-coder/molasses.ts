// Based on the molasses algorithm https://github.com/geoscience-community-codes/MOLASSES

import { maxLat, minLat, minLong, rangeLat, rangeLong } from "./lava-constants";
import { AsciiRaster } from "./parse-ascii-raster";

const millisecondsPerFrame = 200;
const diagonalScale = 1 / Math.sqrt(2);
// The Molasses algorithm spreads for three iterations, which seems to be completely arbitrary
const pulseIterations = 3;

export interface GridCell {
  baseElevation: number;
  elevationDifference: number;
  lavaElevation: number;
  neighbors: GridCell[];
  parents: Set<GridCell>;
  x: number;
  y: number;
}

function createCell(x: number, y: number, baseElevation: number) {
  return {
    baseElevation,
    elevationDifference: 0,
    lavaElevation: 0,
    neighbors: [],
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
  const lowerNeighbors: GridCell[] = [];

  // Set neighbors if necessary
  if (cell.neighbors.length === 0) {
    [-1, 0, 1].forEach(dy => {
      [-1, 0, 1].forEach(dx => {
        if (dx === 0 && dy === 0) return; // Skip the cell itself
        const newY = cell.y + dy;
        const newX = cell.x + dx;
        // Only add the neighbor if it's within the grid bounds
        if (newY >= 0 && newY < grid.length && newX >= 0 && newX < grid[newY].length) {
          const neighbor = grid[newY][newX];
          cell.neighbors.push(neighbor);
        }
      });
    });
  }

  for (const neighbor of cell.neighbors) {
    const dx = neighbor.x - cell.x;
    const dy = neighbor.y - cell.y;
    // Do not send lava back to a cell that already sent lava to you
    if (cell.parents.has(neighbor)) {
      continue;
    }

    const scale = (dx === 0 || dy === 0) ? 1 : diagonalScale;
    const elevationDifference = scale * (getTotalElevation(cell) - getTotalElevation(neighbor));
    // Only add the neighbor if it has a lower elevation
    if (elevationDifference > 0) {
      neighbor.elevationDifference = elevationDifference;
      neighbor.parents.add(cell);
      lowerNeighbors.push(neighbor);
    }
  }

  // Randomize the order of neighbors
  for (let i = lowerNeighbors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lowerNeighbors[i], lowerNeighbors[j]] = [lowerNeighbors[j], lowerNeighbors[i]];
  }

  return lowerNeighbors;
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
  const visitedCells = new Set<GridCell>();
  // The range of the rectangle containing active cells.
  // Note that north is lower than south in the grid.
  const lavaRange = {
    east: -Infinity,
    north: Infinity,
    south: -Infinity,
    west: Infinity
  };

  function validateRange() {
    // Validate lavaRange boundaries
    if (!isFinite(lavaRange.north) || !isFinite(lavaRange.south) || 
        !isFinite(lavaRange.east) || !isFinite(lavaRange.west)) {
      throw new Error("Invalid lavaRange boundaries: Ensure lavaRange is updated to finite values.");
    }
  }

  function getLavaElevationGrid() {
    validateRange();
    const lavaElevationGrid: number[][] = [];
    for (let y = lavaRange.north; y <= lavaRange.south; y++) {
      if (y < 0 || y >= grid.length) continue; // Skip rows outside the grid bounds
      const lavaRow: number[] = [];
      for (let x = lavaRange.west; x <= lavaRange.east; x++) {
        if (x < 0 || x >= grid[y].length) continue; // Skip columns outside the grid bounds
        lavaRow.push(grid[y][x].lavaElevation);
      }
      lavaElevationGrid.push(lavaRow);
    }
    return lavaElevationGrid;
  }

  const sendUpdateMessage = () => {
    validateRange();
    postMessage({
      status: "updatedGrid",
      grid: getLavaElevationGrid(),
      pulseCount,
      gridBounds: {
        east: (lavaRange.east + 1) / grid[0].length * rangeLong + minLong,
        north: maxLat - (lavaRange.north) / grid.length * rangeLat,
        south: maxLat - (lavaRange.south + 1) / grid.length * rangeLat,
        west: (lavaRange.west) / grid[0].length * rangeLong + minLong
      }
    });
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
    visitedCells.clear();
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
                lavaRange.east = Math.max(lavaRange.east, neighbor.x);
                lavaRange.north = Math.min(lavaRange.north, neighbor.y);
                lavaRange.south = Math.max(lavaRange.south, neighbor.y);
                lavaRange.west = Math.min(lavaRange.west, neighbor.x);
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
