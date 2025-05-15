import { types } from "mobx-state-tree";
import MolassesWorker from "../components/lava-coder/molasses.worker";
import { AsciiRaster } from "../components/lava-coder/parse-ascii-raster";
import {
  defaultEruptionVolume, defaultPulseVolume, defaultResidual, defaultVentLatitude, defaultVentLongitude
} from "../components/lava-coder/lava-constants";
import { LavaSimulationAuthorSettings, LavaSimulationAuthorSettingsProps } from "./stores";

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
    residual: defaultResidual,
    ventLatitude: defaultVentLatitude,
    ventLongitude: defaultVentLongitude,
    totalVolume: defaultEruptionVolume,
    pulseVolume: defaultPulseVolume, // Standard for small eruption
    pulseCount: 0,
  })
  .volatile((self) => ({
    coveredCells: 0,
    raster: null as AsciiRaster | null, // AsciiRaster
    worker: null as Worker | null
  }))
  .actions((self) => ({
    countCoveredCells(grid: number[][]) {
      self.coveredCells = countCoveredCells(grid);
    },
    setPulseCount(pulseCount: number) {
      self.pulseCount = pulseCount;
    },
    setRaster(raster: AsciiRaster) {
      self.raster = raster;
    },
    setResidual(residual: number) {
      self.residual = residual;
    },
    setTotalVolume(totalVolume: number) {
      self.totalVolume = totalVolume;
    },
    setTotalVolumeAndUpdatePulseVolume(totalVolume: number) {
      self.totalVolume = totalVolume;
      // Update pulse volume to be proportional to the total volume
      self.pulseVolume = totalVolume * defaultPulseVolume / defaultEruptionVolume;
    },
    setVentLatitude(ventLatitude: number) {
      self.ventLatitude = ventLatitude;
    },
    setVentLongitude(ventLongitude: number) {
      self.ventLongitude = ventLongitude;
    }
  }))
  .actions((self) => {
    return {
      loadAuthorSettingsData: (data: LavaSimulationAuthorSettings) => {
        Object.keys(data).forEach((key: LavaSimulationAuthorSettingsProps) => {
          // annoying `as any ... as any` is needed because we're mixing bool and non-bool props, which combine to never
          // see https://github.com/microsoft/TypeScript/issues/31663
          (self[key] as any) = data[key] as any;
        });
      },
    };
  })
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
        ventLatitude: self.ventLatitude,
        ventLongitude: self.ventLongitude
      };
      self.worker.postMessage({ type: "start", parameters });

      return () => {
        self.worker?.terminate();
      };
    }
  }));
export const lavaSimulation = LavaSimulationStore.create({});

export type LavaSimulationModelType = typeof LavaSimulationStore.Type;
