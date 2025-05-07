import { applySnapshot, types } from "mobx-state-tree";
import MolassesWorker from "../components/lava/molasses.worker";
import { AsciiRaster } from "../components/lava/parse-ascii-raster";

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
    setLavaElevations(lavaElevations: number[][]) {
      applySnapshot(self.lavaElevations, lavaElevations);

      self.coveredCells = 0;
      lavaElevations.forEach(row => {
        row.forEach(lavaElevation => {
          if (lavaElevation > 0) {
            self.coveredCells++;
          }
        });
      });
    },
    setPulseCount(pulseCount: number) {
      self.pulseCount = pulseCount;
    },
    setRaster(raster: AsciiRaster) {
      self.raster = raster;
    }
  }))
  .actions((self) => ({
    runSimulation() {
      self.worker = new MolassesWorker();
      self.worker.onmessage = (e) => {
        try {
          const { status } = e.data;
          if (status === "rasterParsed") {
            self.setRaster(e.data.raster);
          } else if (status === "runningSimulation") {
            console.log(`Running simulation...`);
          } else if (status === "updatedGrid") {
            self.setPulseCount(e.data.pulseCount);
            self.setLavaElevations(e.data.grid);
          }
        } catch (error) {
          console.error("Error handling worker message:", error, e);
        }
      };
  
      self.worker.postMessage({ type: "start" });
  
      return () => {
        self.worker?.terminate();
      };
    }
  }));
export const lavaSimulation = LavaSimulationStore.create({});

export type LavaSimulationModelType = typeof LavaSimulationStore.Type;
