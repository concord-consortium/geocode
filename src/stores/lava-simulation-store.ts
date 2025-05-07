import { applySnapshot, types } from "mobx-state-tree";
import MolassesWorker from "../components/lava-coder/molasses.worker";
import { AsciiRaster } from "../components/lava-coder/parse-ascii-raster";

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
          if (status === "runningSimulation") {
            console.log(`Running simulation...`);
          } else if (status === "updatedGrid") {
            self.setPulseCount(e.data.pulseCount);
            lavaElevations = e.data.grid;
            self.countCoveredCells(e.data.grid);
          }
        } catch (error) {
          console.error("Error handling worker message:", error, e);
        }
      };
  
      self.worker.postMessage({ type: "start", raster: self.raster });
  
      return () => {
        self.worker?.terminate();
      };
    }
  }));
export const lavaSimulation = LavaSimulationStore.create({});

export type LavaSimulationModelType = typeof LavaSimulationStore.Type;
