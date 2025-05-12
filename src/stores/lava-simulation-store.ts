import { types } from "mobx-state-tree";
import MolassesWorker from "../components/lava-coder/molasses.worker";
import { AsciiRaster } from "../components/lava-coder/parse-ascii-raster";

// Saving the lava elevations in the MST model is very slow, so we save it separately.
// But that means that when this is updated, another observable feature (like coveredCells or pulseCount) needs to be
// updated to trigger reactions. And if we need to save the lava elevations for save/load or some other purpose,
// this variable should be saved in the MST model.
export let lavaElevations: number[][] | undefined;

function countCoveredCells(_lavaElevations: number[][]) {
  let coveredCells = 0;
  _lavaElevations.forEach(row => {
    row.forEach(lavaElevation => {
      if (lavaElevation > 0) {
        coveredCells++;
      }
    });
  });
  return coveredCells;
}

export const LavaSimulationStore = types
  .model("lavaSimulation", {
    residual: 5,
    // Recommended vent
    ventEasting: 232214,
    ventNorthing: 2158722,
    // Vent in the main crater
    // ventEasting: 227500,
    // ventNorthing: 2153500,
    // Vent near the north, quickly hitting a wall and splitting
    // ventEasting: 237214,
    // ventNorthing: 2173722,
    // Vent near the north east corner of the current map, quickly falling into the ocean
    // ventEasting: 279000,
    // ventNorthing: 2181000,
    totalVolume: 200000000,
    pulseVolume: 100000, // Standard for small eruption
    pulseCount: 0,
  })
  .volatile((self) => ({
    coveredCells: 0,
    raster: null as AsciiRaster | null, // AsciiRaster
    worker: null as Worker | null
  }))
  .actions((self) => ({
    setPulseCount(pulseCount: number) {
      self.pulseCount = pulseCount;
    },
    setRaster(raster: AsciiRaster) {
      self.raster = raster;
    },
    countCoveredCells(grid: number[][]) {
      self.coveredCells = countCoveredCells(grid);
    }
  }))
  .actions((self) => ({
    runSimulation() {
      if (!self.raster) return;
      
      self.worker = new MolassesWorker();
      self.worker.onmessage = (e) => {
        try {
          const { status } = e.data;
          if (status === "updatedGrid") {
            self.setPulseCount(e.data.pulseCount);
            lavaElevations = e.data.grid;
            self.countCoveredCells(e.data.grid);
          }
        } catch (error) {
          console.error("Error handling worker message:", error, e);
        }
      };
  
      const parameters = {
        pulseVolume: self.pulseVolume,
        raster: self.raster,
        residual: self.residual,
        totalVolume: self.totalVolume,
        ventEasting: self.ventEasting,
        ventNorthing: self.ventNorthing
      };
      self.worker.postMessage({ type: "start", parameters });
  
      return () => {
        self.worker?.terminate();
      };
    }
  }));
export const lavaSimulation = LavaSimulationStore.create({});

export type LavaSimulationModelType = typeof LavaSimulationStore.Type;
