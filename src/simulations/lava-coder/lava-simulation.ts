// Based on the molasses algorithm https://github.com/geoscience-community-codes/MOLASSES

import { convertLatitudeToY, convertLongitudeToX } from "../../utilities/molasses-utils";
import { maxLat, minLong, rangeLat, rangeLong } from "./lava-constants";
import { AsciiRaster } from "./parse-ascii-raster";

const diagonalScale = 1 / Math.sqrt(2);
// The Molasses algorithm spreads for three iterations, which seems to be completely arbitrary
export const pulseIterations = 3;

export interface GridCell {
  baseElevation: number;
  elevationDifference: number;
  lavaElevation: number;
  neighbors: GridCell[];
  parents: Set<GridCell>;
  x: number;
  y: number;
}

export interface LavaSimulationParameters {
  pulseVolume: number;
  raster: AsciiRaster;
  residual: number;
  totalVolume: number;
  ventLatitude: number;
  ventLongitude: number;
}

export class LavaSimulation {
  public pulseCount = 0;
  private grid: GridCell[][] = [];
  private ventX: number;
  private ventY: number;
  private ventCell: GridCell;
  private cellArea: number;
  private residual: number;
  public currentTotalVolume: number;
  private pulseVolume: number;
  private visitedCells = new Set<GridCell>();

  // The range of the rectangle containing active cells.
  // Note that north is lower than south in the grid.
  private lavaRange = {
    east: -Infinity,
    north: Infinity,
    south: -Infinity,
    west: Infinity
  };

  constructor({ pulseVolume, raster, residual, totalVolume, ventLatitude, ventLongitude }: LavaSimulationParameters) {
    this.grid = this.createGrid(raster);
    this.ventX = convertLongitudeToX(ventLongitude, raster);
    this.ventY = convertLatitudeToY(ventLatitude, raster);
    this.ventCell = this.grid[this.ventY][this.ventX];
    this.cellArea = raster.header.cellsize ** 2;
    this.residual = residual;
    this.currentTotalVolume = totalVolume;
    this.pulseVolume = pulseVolume;
  }

  private createCell(x: number, y: number, baseElevation: number) {
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

  public createGrid(raster: AsciiRaster) {
    const grid: GridCell[][] = [];
    raster.values.forEach((row, y) => {
      const gridRow: GridCell[] = [];
      row.forEach((baseElevation, x) => {
        gridRow.push(this.createCell(x, y, baseElevation));
      });
      grid.push(gridRow);
    });
    return grid;
  }

  private getTotalElevation(cell: GridCell) {
    return cell.baseElevation + cell.lavaElevation;
  }

  public getLowerNeighbors(cell: GridCell, grid: GridCell[][]) {
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
      const elevationDifference = scale * (this.getTotalElevation(cell) - this.getTotalElevation(neighbor));
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

  public sendStepMessage = (complete = false) => {
    postMessage({ status: "step", complete });
  };

  private validateRange() {
    // Validate lavaRange boundaries
    if (!isFinite(this.lavaRange.north) || !isFinite(this.lavaRange.south) || 
        !isFinite(this.lavaRange.east) || !isFinite(this.lavaRange.west)) {
      throw new Error("Invalid lavaRange boundaries: Ensure lavaRange is updated to finite values.");
    }
  }

  private getLavaElevationGrid() {
    this.validateRange();
    const lavaElevationGrid: number[][] = [];
    for (let y = this.lavaRange.north; y <= this.lavaRange.south; y++) {
      if (y < 0 || y >= this.grid.length) continue; // Skip rows outside the grid bounds
      const lavaRow: number[] = [];
      for (let x = this.lavaRange.west; x <= this.lavaRange.east; x++) {
        if (x < 0 || x >= this.grid[y].length) continue; // Skip columns outside the grid bounds
        lavaRow.push(this.grid[y][x].lavaElevation);
      }
      lavaElevationGrid.push(lavaRow);
    }
    return lavaElevationGrid;
  }

  public sendUpdateMessage = (complete = false) => {
    this.validateRange();
    postMessage({
      status: "updatedGrid",
      complete,
      grid: this.getLavaElevationGrid(),
      pulseCount: this.pulseCount,
      gridBounds: {
        east: (this.lavaRange.east + 1) / this.grid[0].length * rangeLong + minLong,
        north: maxLat - (this.lavaRange.north) / this.grid.length * rangeLat,
        south: maxLat - (this.lavaRange.south + 1) / this.grid.length * rangeLat,
        west: (this.lavaRange.west) / this.grid[0].length * rangeLong + minLong
      }
    });
  };

  public stepSimulation() {
    // Add lava to the vent cell
    const currentPulseVolume = Math.min(this.currentTotalVolume, this.pulseVolume);
    this.currentTotalVolume -= currentPulseVolume;
    const pulseHeight = currentPulseVolume / this.cellArea;
    this.ventCell.lavaElevation += pulseHeight;

    // Spread the lava
    const activeCells = [this.ventCell];
    this.visitedCells.clear();
    for (let count = 0; count < pulseIterations; count++) {
      for (const currentCell of activeCells) {
        this.visitedCells.add(currentCell);
        if (currentCell.lavaElevation > this.residual) {
          const lavaToSpread = currentCell.lavaElevation - this.residual;

          // Find neighbors that can receive lava
          const neighbors = this.getLowerNeighbors(currentCell, this.grid);

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

              if (!this.visitedCells.has(neighbor) && neighbor.lavaElevation > this.residual) {
                activeCells.push(neighbor);
                this.lavaRange.east = Math.max(this.lavaRange.east, neighbor.x);
                this.lavaRange.north = Math.min(this.lavaRange.north, neighbor.y);
                this.lavaRange.south = Math.max(this.lavaRange.south, neighbor.y);
                this.lavaRange.west = Math.min(this.lavaRange.west, neighbor.x);
              }
            });
          }
        }
      }
    }
  }
}
