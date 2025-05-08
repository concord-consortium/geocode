import { applySnapshot, types } from "mobx-state-tree";
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
    ventEasting: 232214,
    ventNorthing: 2158722,
    // Other useful vent location for testing:
    // ventEasting: 242214,
    // ventNorthing: 2168722,
    // ventEasting: 237214,
    // ventNorthing: 2173722,
    totalVolume: 200000000,
    pulseVolume: 100000, // Standard for small eruption
    pulseCount: 0,
    lavaElevations: types.array(types.array(types.number)),
    raster: types.maybeNull(types.frozen()), // AsciiRaster
  })
  .volatile((self) => ({
    coveredCells: 0,
    worker: null as Worker | null
  }))
  .actions((self) => ({
    // FIXME: Set the MST lava elevations when saving. It is too slow to do it frequently.
    setLavaElevations(_lavaElevations: number[][]) {
      applySnapshot(self.lavaElevations, _lavaElevations);
    },
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
