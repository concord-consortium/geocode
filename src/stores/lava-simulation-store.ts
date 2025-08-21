import { KmlDataSource, Math as CSMath } from "@cesium/engine";
import { observable } from "mobx";
import { types } from "mobx-state-tree";
import MolassesWorker from "../components/lava-coder/molasses.worker";
import { AsciiRaster } from "../components/lava-coder/parse-ascii-raster";
import {
  defaultEruptionVolume, defaultResidual, defaultVentLatitude, defaultVentLongitude, FlagColor, flagLabels,
  kSquareMetersPerAcre, maxFlags
} from "../components/lava-coder/lava-constants";
import { DataTable, DataTableType } from "../models/data-table";
import { pointInPolygon } from "../utilities/geometry-utils";
import { isPointOnIsland } from "../utilities/molasses-utils";
import { LavaSimulationAuthorSettings, LavaSimulationAuthorSettingsProps } from "./stores";
import { uiStore } from "./ui-store";

// Saving the lava elevations in the MST model is very slow, so we save it separately.
// But that means that when this is updated, another observable feature (like coveredCells or pulseCount) needs to be
// updated to trigger reactions. And if we need to save the lava elevations for save/load or some other purpose,
// this variable should be saved in the MST model.
export let lavaElevations: number[][] | undefined;
// The latitude/longitude bounds of the rectangle containing all lava
export let gridBounds: { east: number, north: number, south: number, west: number } | undefined;

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

interface FlagLocation {
  color: FlagColor;
  name: string;
  label?: string;
  latitude: number;
  longitude: number;
}

export const LavaSimulationStore = types
  .model("lavaSimulation", {
    residual: defaultResidual,
    ventLatitude: defaultVentLatitude,
    ventLongitude: defaultVentLongitude,
    totalVolume: defaultEruptionVolume,
    pulseCount: 0,
  })
  .volatile((self) => ({
    coveredCells: 0,
    dataTable: undefined as DataTableType | undefined,
    flagLocations: observable.array<FlagLocation>([]),
    raster: null as AsciiRaster | null, // AsciiRaster
    worker: null as Worker | null,
    resetCount: 0, // Used to reset the camera when the simulation is reset
    hazardZones: null as KmlDataSource | null
  }))
  .views((self) => ({
    get cellArea() {
      return (self.raster?.header.cellsize ?? 60) ** 2; // Default cell size is 60 meters
    },
    isPointOnIsland(latitude: number, longitude: number) {
      if (!self.raster) return false;
      return isPointOnIsland(latitude, longitude, self.raster);
    },
    get isRunning() {
      return self.worker != null && self.pulseCount < uiStore.pulsesPerEruption;
    },
    isPointInHazardZone(latitude: number, longitude: number) {
      if (!self.hazardZones) return false;
  
      const latitudeRadians = CSMath.toRadians(latitude);
      const longitudeRadians = CSMath.toRadians(longitude);
      const hazardZoneEntities = self.hazardZones.entities.values;
      for (const entity of hazardZoneEntities) {
        if (entity.polygon?.hierarchy) {
          const hierarchy = entity.polygon.hierarchy.getValue();
          // hierarchy.positions is an array of Cartesian positions
          if (pointInPolygon(latitudeRadians, longitudeRadians, hierarchy.positions)) {
            return true;
          }
        }
      }
      return false;
    }
  }))
  .views((self) => ({
    get acresCovered() {
      return self.coveredCells * self.cellArea / kSquareMetersPerAcre; // Convert square meters to acres
    }
  }))
  .actions((self) => ({
    addFlagLocation(flag: FlagLocation) {
      if (self.flagLocations.length < maxFlags) {
        self.flagLocations.push({ label: flagLabels[self.flagLocations.length], ...flag });
      }
    },
    clearDataTable() {
      self.dataTable = undefined;
    },
    clearFlagPositions() {
      self.flagLocations.clear();
    },
    countCoveredCells(grid: number[][]) {
      self.coveredCells = countCoveredCells(grid);
    },
    newDataTable() {
      self.dataTable = DataTable.create();
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
    setVentLocation(latitude: number, longitude: number) {
      self.ventLatitude = latitude;
      self.ventLongitude = longitude;
    },
    setHazardZones(hazardZones: KmlDataSource) {
      self.hazardZones = hazardZones;
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
      resetDefaults: () => {
        self.setResidual(defaultResidual);
        self.setTotalVolume(defaultEruptionVolume);
        self.setVentLocation(defaultVentLatitude, defaultVentLongitude);
      }
    };
  })
  .actions((self) => ({
    runSimulation(onFinish?: () => void) {
      if (!self.raster) return;

      if (self.worker) {
        self.setPulseCount(0);
        self.worker.terminate();
      }

      self.worker = new MolassesWorker();
      self.worker.onmessage = (e) => {
        try {
          const { complete, status } = e.data;
          if (status === "updatedGrid") {
            self.setPulseCount(e.data.pulseCount);
            lavaElevations = e.data.grid;
            gridBounds = e.data.gridBounds;
            self.countCoveredCells(e.data.grid);

            if (complete) onFinish?.();
          }
        } catch (error) {
          console.error("Error handling worker message:", error, e);
        }
      };

      const parameters = {
        pulseVolume: self.totalVolume / uiStore.pulsesPerEruption,
        raster: self.raster,
        residual: self.residual,
        totalVolume: self.totalVolume,
        ventLatitude: self.ventLatitude,
        ventLongitude: self.ventLongitude
      };
      self.worker.postMessage({ type: "start", parameters });
    },
    reset() {
      // Terminate the active simulation worker if it exists
      if (self.worker) {
        self.worker.terminate();
        self.worker = null;
      }
      lavaElevations = [];
      self.setPulseCount(0);
      self.resetDefaults();
      self.clearFlagPositions();
      self.clearDataTable();
      self.coveredCells = 0;
      ++self.resetCount;
    }
  }));
export const lavaSimulation = LavaSimulationStore.create({});

export type LavaSimulationModelType = typeof LavaSimulationStore.Type;
