// Based on the molasses algorithm https://github.com/geoscience-community-codes/MOLASSES

import { AsciiRaster } from "./parse-ascii-raster";

const cParents = false; // If true, replicate the incorrect method of determining parents from the c version
const trueParents = true;
const pulsesPerMessage = 50;
const diagonalScale = 1 / Math.sqrt(2);

const ventEasting = 232214; // Suggested location
const ventNorthing = 2158722; // Suggested location
// const ventEasting = 242214;
// const ventNorthing = 2168722;
// const ventEasting = 237214;
// const ventNorthing = 2173722;
let ventX = -1;
let ventY = -1;
export const residual = 5;
const totalVolume = 200000000;
const pulseVolume = 100000; // Standard for small eruption
// const pulseVolume = 500000;

export interface GridCell {
  baseElevation: number;
  elevationDifference: number;
  lavaElevation: number;
  parentDX?: number;
  parentDY?: number;
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

function convertEastingToX(easting: number, raster: AsciiRaster) {
  return Math.floor((easting - raster.header.xllcorner) / raster.header.cellsize);
}

function convertNorthingToY(northing: number, raster: AsciiRaster) {
  return raster.header.nrows - Math.floor((northing - raster.header.yllcorner) / raster.header.cellsize);
}

function getVentCell(grid: GridCell[][]) {
  return grid[ventY][ventX];
}

function getTotalElevation(cell: GridCell) {
  return cell.baseElevation + cell.lavaElevation;
}

function getLowerNeighbors(cell: GridCell, grid: GridCell[][]) {
  const neighbors: GridCell[] = [];
  [-1, 0, 1].forEach(dy => {
    [-1, 0, 1].forEach(dx => {
      if (dx === 0 && dy === 0) return; // Skip the cell itself
      // Skip the "parent".
      // Following a bug in the c algorithm, this includes any neighbors in any of the same directions as the actual parent.
      // ...which is really just the last parent.
      if (cParents && cell.parentDX && cell.parentDX === dx && cell.parentDY && cell.parentDY === dy) return;

      const newY = cell.y + dy;
      const newX = cell.x + dx;
      // Only add the neighbor if it's within the grid bounds
      if (newY >= 0 && newY < grid.length && newX >= 0 && newX < grid[newY].length) {
        const neighbor = grid[newY][newX];
        if (trueParents && cell.parents.has(neighbor)) return;
        const scale = (dx === 0 || dy === 0) ? 1 : diagonalScale;
        const elevationDifference = scale * (getTotalElevation(cell) - getTotalElevation(neighbor));
        // Only add the neighbor if it has a lower elevation
        if (elevationDifference > 0) {
          neighbor.elevationDifference = elevationDifference;
          neighbor.parents.add(cell);
          neighbor.parentDX = -1 * dx;
          neighbor.parentDY = -1 * dy;
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

export async function runSimulation(raster: AsciiRaster, postMessage: (message: any) => void) {
  let pulseCount = 0;
  const startTime = Date.now();
  const grid = createGrid(raster);
  ventX = convertEastingToX(ventEasting, raster);
  ventY = convertNorthingToY(ventNorthing, raster);
  const cellArea = raster.header.cellsize ** 2;
  let currentTotalVolume = totalVolume;
  const sendUpdateMessage = () => {
    postMessage({ status: "updatedGrid", grid: getLavaElevationGrid(grid), pulseCount });
  };

  while (currentTotalVolume > 0) {
    // Add lava to the vent cell
    const currentPulseVolume = Math.min(currentTotalVolume, pulseVolume);
    currentTotalVolume -= currentPulseVolume;
    const pulseHeight = currentPulseVolume / cellArea;
    getVentCell(grid).lavaElevation += pulseHeight;

    // Spread the lava
    const activeCells = [getVentCell(grid)];
    const visitedCells = new Set<GridCell>();
    // The Molasses algorithm spreads for three iterations, which seems to be completely arbitrary
    for (let count = 0; count < 3; count++) {
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
              neighbor.lavaElevation += lavaToTransfer;

              if (!visitedCells.has(neighbor) && neighbor.lavaElevation > residual) {
                activeCells.push(neighbor);
              }
            });
          }
        }
      }
    }

    pulseCount++;
    if (pulseCount % pulsesPerMessage === 0) {
      sendUpdateMessage();
    }
  }

  // Send a final update if the last pulse is off
  if (pulseCount % pulsesPerMessage !== 0) {
    sendUpdateMessage();
  }

  const endTime = Date.now();
  console.log(`  - Simulation completed in ${endTime - startTime} ms`);
}
