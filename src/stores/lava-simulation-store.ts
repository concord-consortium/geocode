import { KmlDataSource, Math as CSMath } from "@cesium/engine";
import { observable } from "mobx";
import { types } from "mobx-state-tree";
import MolassesWorker from "../simulations/lava-coder/molasses.worker";
import { AsciiRaster } from "../simulations/lava-coder/parse-ascii-raster";
import { WindPattern } from "../types/lava-coder/lava-coder-types";
import {
  defaultEruptionVolume, defaultResidual, defaultShowWindPattern, defaultVentLatitude, defaultVentLongitude,
  defaultWindPattern, FlagColor, flagLabels, kSquareMetersPerAcre, maxFlags
} from "../simulations/lava-coder/lava-constants";
import VogWorker from "../simulations/lava-coder/vog.worker";
import { DataRow, DataTable, DataTableType } from "../models/data-table";
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

export let vogConcentrations: number[][] | undefined;
export let vogBounds: { east: number, north: number, south: number, west: number } | undefined;

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
    windPattern: defaultWindPattern
  })
  .volatile((self) => ({
    coveredCells: 0,
    voggedCells: 0,
    dataTable: undefined as DataTableType | undefined,
    showWindPattern: defaultShowWindPattern,
    flagLocations: observable.array<FlagLocation>([]),
    raster: null as AsciiRaster | null, // AsciiRaster
    worker: null as Worker | null,
    vogWorker: null as Worker | null,
    resetCount: 0, // Used to clear the lat/long overlay when the simulation is reset
    hazardZones: null as KmlDataSource | null
  }))
  .views((self) => ({
    get cellArea() {
      return (self.raster?.header.cellsize ?? 60) ** 2; // Default cell size is 60 meters
    },
    get hasOnlyDefaultParameters() {
      return self.residual === defaultResidual && self.totalVolume === defaultEruptionVolume &&
        self.ventLatitude === defaultVentLatitude && self.ventLongitude === defaultVentLongitude;
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
    },
    lavaDepthAtPoint(latitude: number, longitude: number) {
      if (!lavaElevations || !gridBounds) return 0;

      const { east, north, south, west } = gridBounds;
      const column = Math.floor((longitude - west) / (east - west) * lavaElevations[0].length);
      const row = Math.floor((north - latitude) / (north - south) * lavaElevations.length);
      if (row < 0 || row >= lavaElevations.length || column < 0 || column >= lavaElevations[0].length) {
        return 0;
      }
      return lavaElevations[row][column];
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
    addRowToTable(flag: FlagLocation) {
      self.dataTable?.addRow(DataRow.create({ label: "", ...flag }));
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
    countVoggedCells(grid: number[][]) {
      self.voggedCells = countCoveredCells(grid);
    },
    newDataTable() {
      self.dataTable = DataTable.create();
    },
    setShowWindPattern(display: boolean) {
      self.showWindPattern = display;
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
    },
    setWindPattern(pattern: WindPattern) {
      self.windPattern = pattern;
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
        self.setShowWindPattern(defaultShowWindPattern);
        self.setResidual(defaultResidual);
        self.setTotalVolume(defaultEruptionVolume);
        self.setVentLocation(defaultVentLatitude, defaultVentLongitude);
        self.setWindPattern(defaultWindPattern);
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
    runVogSimulation(onFinish?: () => void) {
      if (!self.raster) return;

      if (self.vogWorker) {
        self.vogWorker.terminate();
      }

      self.vogWorker = new VogWorker();
      self.vogWorker.onmessage = (e) => {
        try {
          const { status } = e.data;
          if (status === "updatedVog") {
            vogConcentrations = e.data.grid;
            vogBounds = e.data.gridBounds;
            self.countVoggedCells(e.data.grid);

            if (e.data.complete) onFinish?.();
          }
        } catch (error) {
          console.error("Error handling vog worker message:", error, e);
        }
      };

      const parameters = {
        pulses: uiStore.pulsesPerEruption,
        raster: self.raster,
        totalVolume: self.totalVolume,
        ventLatitude: self.ventLatitude,
        ventLongitude: self.ventLongitude,
        windPattern: self.windPattern
      };
      self.vogWorker.postMessage({ type: "start", parameters });
    },
    reset() {
      // Terminate the active simulation worker if it exists
      if (self.worker) {
        self.worker.terminate();
        self.worker = null;
      }
      if (self.vogWorker) {
        self.vogWorker.terminate();
        self.vogWorker = null;
      }
      lavaElevations = [];
      vogConcentrations = [];
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
