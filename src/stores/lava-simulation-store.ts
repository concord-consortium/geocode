import { KmlDataSource, Math as CSMath } from "@cesium/engine";
import { observable } from "mobx";
import { types } from "mobx-state-tree";
import { DataRow, DataTable, DataTableType } from "../models/data-table";
import { MultirunTable, MultirunTableType, RunRow } from "../models/multirun-table";
import {
  defaultEruptionVolume, defaultResidual, defaultShowWindPattern, defaultVentLatitude, defaultVentLongitude,
  flagLabels, kSquareMetersPerAcre, maxFlags
} from "../simulations/lava-coder/lava-constants";
import LavaWorker from "../simulations/lava-coder/lava.worker";
import { AsciiRaster } from "../simulations/lava-coder/parse-ascii-raster";
import VogWorker from "../simulations/lava-coder/vog.worker";
import { FlagLocation, WindPattern } from "../types/lava-coder/lava-coder-types";
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

export interface RunFootprint {
  grid: number[][];
  bounds: { east: number, north: number, south: number, west: number };
  // The thickness this run used. visualizeLava() scales its colour ramp by it, so replaying
  // a run with the *current* thickness would render it with the wrong colours.
  residual: number;
  // Cached gray rendering, used when this run sits behind the one being displayed. The grid
  // and residual never change once the run completes, so it only has to be built once.
  grayUrl?: string;
}
// Completed-run footprints, keyed by run number. Held outside the MST model for the same
// reason lavaElevations is — see the note above. Each entry is only the bounding box of that
// run's lava, so these are small (hundreds of KB), not the whole island raster.
export const runFootprints = new Map<number, RunFootprint>();

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
    pulseCount: 0
  })
  .volatile((self) => ({
    paused: false,
    parameterSet: false, // At least one parameter must be set before running the simulation
    coveredCells: 0,
    voggedCells: 0,
    dataTable: undefined as DataTableType | undefined,
    // Undefined until the program's "Create a multirun data table" block runs, so the Multirun
    // tab is empty until the student asks for a table.
    multirunTable: undefined as MultirunTableType | undefined,
    // Run number whose footprint is displayed instead of the live one; undefined = live.
    selectedRunNumber: undefined as number | undefined,
    showWindPattern: defaultShowWindPattern,
    flagLocations: observable.array<FlagLocation>([]),
    raster: null as AsciiRaster | null, // AsciiRaster
    lavaWorker: null as Worker | null,
    vogWorker: null as Worker | null,
    resetCount: 0, // Used to clear the lat/long overlay when the simulation is reset
    hazardZones: null as KmlDataSource | null,
    windPattern: null as WindPattern | null
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
      return self.lavaWorker != null && self.pulseCount < uiStore.pulsesPerEruption;
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
    },
    vogConcentrationAtPoint(latitude: number, longitude: number) {
      if (!vogConcentrations || !vogBounds) return 0;

      const { east, north, south, west } = vogBounds;
      const column = Math.floor((longitude - west) / (east - west) * vogConcentrations[0].length);
      const row = Math.floor((north - latitude) / (north - south) * vogConcentrations.length);
      if (row < 0 || row >= vogConcentrations.length || column < 0 || column >= vogConcentrations[0].length) {
        return 0;
      }
      return vogConcentrations[row][column];
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
    // Called as a run STARTS, so the row and its toolbar circle appear immediately rather than
    // only once the run finishes. The parameters are known now; the area fills in as it runs.
    beginRun() {
      // No table means the program never asked for one. The simulation still runs; it just
      // isn't recorded.
      if (!self.multirunTable) return undefined;
      const runNumber = self.multirunTable.nextRunNumber;
      self.multirunTable.addRow(RunRow.create({
        runNumber,
        lavaThickness: self.residual,
        eruptionVolume: self.totalVolume,
        acresCovered: 0,
        complete: false
      }));
      // The erupting run is the one on display, so its circle reads as selected. There is no
      // stored footprint for it yet, so the overlay falls through to the live lava.
      self.selectedRunNumber = runNumber;
      return runNumber;
    },
    newMultirunTable() {
      self.multirunTable = MultirunTable.create();
    },
    updateRunAcres(runNumber: number) {
      self.multirunTable?.row(runNumber)?.setAcresCovered(self.acresCovered);
    },
    completeRun(runNumber: number) {
      const row = self.multirunTable?.row(runNumber);
      if (!row) return;
      row.setAcresCovered(self.acresCovered);
      row.setComplete(true);
      // Keep this run's footprint so the row can redisplay it later. The worker hands us a new
      // array each message, so holding the reference is safe — the next run won't mutate it.
      if (lavaElevations && gridBounds) {
        runFootprints.set(runNumber, { grid: lavaElevations, bounds: gridBounds, residual: row.lavaThickness });
      }
    },
    setSelectedRunNumber(runNumber: number | undefined) {
      self.selectedRunNumber = runNumber;
    },
    clearDataTable() {
      self.dataTable = undefined;
    },
    clearFlagPositions() {
      self.flagLocations.clear();
    },
    clearMultirunTable() {
      // Back to undefined, not just empty: the Multirun tab shows no table at all until a
      // program creates one.
      self.multirunTable = undefined;
      runFootprints.clear();
      self.selectedRunNumber = undefined;
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
    pause() {
      self.paused = true;
      self.lavaWorker?.postMessage({ type: "pause" });
      self.vogWorker?.postMessage({ type: "pause" });
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
      self.parameterSet = true;
    },
    setTotalVolume(totalVolume: number) {
      self.totalVolume = totalVolume;
      self.parameterSet = true;
    },
    setVentLocation(latitude: number, longitude: number) {
      self.ventLatitude = latitude;
      self.ventLongitude = longitude;
      self.parameterSet = true;
    },
    setHazardZones(hazardZones: KmlDataSource) {
      self.hazardZones = hazardZones;
    },
    setWindPattern(pattern: WindPattern | null) {
      self.windPattern = pattern;
    },
    unpause() {
      self.paused = false;
      self.lavaWorker?.postMessage({ type: "unpause" });
      self.vogWorker?.postMessage({ type: "unpause" });
    },
  }))
  .actions((self) => ({
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
      self.setWindPattern(null);
      self.parameterSet = false;
    }
  }))
  .actions((self) => ({
    runSimulation(sim: "lava" | "vog" | "both", onFinish?: () => void) {
      if (!self.raster) return;

      let completeSims = 0;
      // Set below when a lava run starts. A vog-only run produces no lava footprint, so it
      // gets no row in the Multirun table.
      let runNumber: number | undefined;
      const completeSim = () => {
        if (++completeSims >= (sim === "both" ? 2 : 1)) {
          if (runNumber != null) self.completeRun(runNumber);
          onFinish?.();
        }
      };

      const parameters = {
        pulses: uiStore.pulsesPerEruption,
        pulseVolume: self.totalVolume / uiStore.pulsesPerEruption,
        raster: self.raster,
        residual: self.residual,
        totalVolume: self.totalVolume,
        ventLatitude: self.ventLatitude,
        ventLongitude: self.ventLongitude,
        windPattern: self.windPattern
      };

      const runLava = sim === "lava" || sim === "both";
      const runVog = sim === "vog" || sim === "both";
      if (runLava) {
        if (self.lavaWorker) {
          self.setPulseCount(0);
          self.lavaWorker.terminate();
        }

        runNumber = self.beginRun();

        self.lavaWorker = new LavaWorker();
        let lastStepTime = Date.now();
        self.lavaWorker.onmessage = (e) => {
          try {
            const { complete, status } = e.data;
            if (status === "updatedGrid") {
              self.setPulseCount(e.data.pulseCount);
              lavaElevations = e.data.grid;
              gridBounds = e.data.gridBounds;
              self.countCoveredCells(e.data.grid);
              if (runNumber != null) self.updateRunAcres(runNumber);

              if (complete) completeSim();
            } else if (status === "step") {
              const stepDuration = Date.now() - lastStepTime;
              lastStepTime = Date.now();
              if (runVog) {
                self.vogWorker?.postMessage({ type: "step" });
                // The vog simulation has twice as many steps as the lava simulation
                setTimeout(() => self.vogWorker?.postMessage({ type: "step", complete }), stepDuration / 2);
              }
            }
          } catch (error) {
            console.error("Error handling worker message:", error, e);
          }
        };

        self.lavaWorker.postMessage({ type: "run", parameters });
      }

      if (runVog) {
        if (self.vogWorker) {
          self.vogWorker.terminate();
        }

        // Clear flag location vog concentrations
        self.flagLocations.forEach(flag => {
          flag.vogConcentration = 0;
        });

        self.vogWorker = new VogWorker();
        self.vogWorker.onmessage = (e) => {
          try {
            const { complete, status } = e.data;
            if (status === "updatedVog") {
              vogConcentrations = e.data.grid;
              vogBounds = e.data.gridBounds;
              self.countVoggedCells(e.data.grid);

              // Update flag location vog concentrations
              self.flagLocations.forEach(flag => {
                const vogConcentration = self.vogConcentrationAtPoint(flag.latitude, flag.longitude);
                flag.vogConcentration = Math.max(flag.vogConcentration ?? 0, vogConcentration);
              });

              if (complete) completeSim();
            }
          } catch (error) {
            console.error("Error handling vog worker message:", error, e);
          }
        };

        self.vogWorker.postMessage({ type: "setup", parameters });
        // If the lava simulation is also running, it will manage the progress of the vog simulation
        if (!runLava) self.vogWorker.postMessage({ type: "run" });
      }
    },
    reset() {
      // Terminate the active simulation worker if it exists
      if (self.lavaWorker) {
        self.lavaWorker.terminate();
        self.lavaWorker = null;
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
      // The table goes with every reset. blocklyController.run() resets before each program,
      // and the program's "Create a multirun data table" block then makes a fresh one, so a
      // program still accumulates all of its runs in one table.
      self.setSelectedRunNumber(undefined);
      self.clearMultirunTable();
      self.coveredCells = 0;
      ++self.resetCount;
    }
  }));
export const lavaSimulation = LavaSimulationStore.create({});

export type LavaSimulationModelType = typeof LavaSimulationStore.Type;
