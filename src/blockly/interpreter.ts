import { ITephraModelParams, SimOutput, SimulationVariable, TephraSimulationStore } from "../stores/tephra-simulation-store";
import { BlocklyController } from "./blockly-controller";
import { TephraSimulationModelType } from "../stores/tephra-simulation-store";
import { IBlocklyWorkspace } from "../interfaces";
import { IStore } from "../stores/stores";
import { Datasets, Dataset, Filter, ProtoTimeRange, TimeRange } from "../stores/data-sets";
import { StationData } from "../strain";
import { ColorMethod } from "../stores/seismic-simulation-store";
const Interpreter = require("js-interpreter");

const makeInterpreterFunc = (blocklyController: BlocklyController, store: IStore,
                             workspace: IBlocklyWorkspace) => {

  const { tephraSimulation, seismicSimulation, chartsStore, samplesCollectionsStore } = store;

  return (interpreter: any, scope: any) => {
    const addVar = (name: string, value: any) => {
      interpreter.setProperty(scope, name, value);
    };

    // the native function wraps arguments to functions as {data: any} or {properties: {data: any}[]}
    const unwrap = (args: any[]) => {
      const unwrapArg = (a: any) => {
        if (a.data !== undefined && a.data !== null) {return a.data; }
        if (a.properties) {
          const returnObject: { [key: string]: any } = {};
          const keys = Object.keys(a.properties);
          keys.forEach( (k) => {
            if (typeof a.properties[k].properties === "object") {
              returnObject[k] = unwrapArg(a.properties[k]); // recurse
            } else {
              returnObject[k] = a.properties[k].data;
            }
          });
          return returnObject;
        }
      };
      const modifiedArgs = args.map(unwrapArg);
      return modifiedArgs;
    };

    const addFunc = (name: string, func: (args: any) => any) => {
      const unwrappingFunction = (...args: any) => {
        const params = (unwrap(args)[0]) as any;
        return func(params);
      };
      const wrapped = interpreter.createNativeFunction(unwrappingFunction);
      addVar(name, wrapped);
    };

    /** ==== Tephra simulation model setters ==== */

    addFunc("setModelParams", (params: ITephraModelParams) => {
      tephraSimulation.setModelParams(params);
    });
    addFunc("setWindDirection", (direction: number) => {
      if (direction === undefined) {
        blocklyController.throwError("You must set a value for the wind direction.");
        return;
      }
      tephraSimulation.setWindDirection(direction);
    });

    addFunc("setWindspeed", (speed: number) => {
      if (speed === undefined) {
        blocklyController.throwError("You must set a value for the wind speed.");
        return;
      }
      tephraSimulation.setWindSpeed(speed);
    });

    addFunc("setWindspeedAndDirection", (windSample?: any) => {
      if (windSample) {
        tephraSimulation.setWindSpeed(windSample.speed);
        tephraSimulation.setWindDirection(windSample.direction);
      } else {
        blocklyController.throwError("You must add a dataset for the wind sample.");
        return;
      }
    });

    addFunc("setMass", (mass: number) => {
      if (mass === undefined) {
        blocklyController.throwError("You must set a value for the eruption mass.");
        return;
      }
      tephraSimulation.setMass(mass);
    });

    addFunc("setVolume", (volume: number) => {
      if (volume === undefined) {
        blocklyController.throwError("You must set a value for the eruption volume.");
        return;
      }
      // +9 km^3 to m^3, +3 m^3 to kg
      const massInKilograms = volume * Math.pow(10, 9 + 3);
      tephraSimulation.setMass(massInKilograms);
    });

    addFunc("setVEI", (vei: number) => {
      if (vei === undefined) {
        blocklyController.throwError("You must set a value for the eruption VEI.");
        return;
      }
      tephraSimulation.setVEI(vei);
    });

    addFunc("setColumnHeight", (height: number) => {
      if (height === undefined) {
        blocklyController.throwError("You must set a value for the eruption column height.");
        return;
      }
      tephraSimulation.setColumnHeight(height);
    });

    addFunc("setVolcano", (params: {x: number, y: number}) => {
      tephraSimulation.setVolcano(params.x, params.y);
    });

    /** ==== Run tephra simulation model ==== */

    addFunc("erupt", () => {
      tephraSimulation.erupt();
    });

    interface WindDataCase {speed: number; direction: number; }

    // Returns tephra thickness at a specific location, given by a samples collection, with various inputs
    addFunc("computeTephra", (params: {location: string, windSamples?: Dataset, vei?: number}) => {

      const { location, windSamples, vei } = params;
      if (vei === undefined) {
        blocklyController.throwError("You must set a value for the eruption VEI.");
        return;
      }
      if (!windSamples) {
        blocklyController.throwError("You must add a dataset for the wind sample.");
        return;
      }

      const samplesLocation = samplesCollectionsStore.samplesLocation(location);
      if (!samplesLocation) {
        blocklyController.throwError("The samples location selected is not valid. Make sure you create it first.");
        return;
      }

      const VEI = vei;
      let windSpeed = 0;
      let windDirection = 0;
      if (windSamples && windSamples.length > 0) {
        const windSample = (Datasets.getRandomSampleWithReplacement(windSamples, 1)[0] as any) as WindDataCase;
        windSpeed = windSample.speed;
        // Wind data is stored using direction to, but we use direction from. Need to convert.
        windDirection = windSample.direction < 180 ? windSample.direction + 180 : windSample.direction - 180;
      }
      tephraSimulation.setWindSpeed(windSpeed);
      tephraSimulation.setWindDirection(windDirection);
      tephraSimulation.setVEI(VEI);

      const thickness = tephraSimulation.calculateTephraAtLocation(samplesLocation.x, samplesLocation.y);

      return {
        data: thickness
      };
    });

    /** ==== Draw on tephra map ==== */

    addFunc("paintMap", () => {
      tephraSimulation.paintMap();
    });

    addFunc("addCity", (params: {x: number, y: number, name: string}) => {
      tephraSimulation.addCity(params.x, params.y, params.name);
    });

    /** ==== Data and graphing ==== */

    addFunc("getAllWindData", () => {
      // all data returned by functions must be wrapped in `{ data: ret }`
      return {
        data: Datasets.getAllData("Wind Data")
      };
    });

    addFunc("sampleDataset", (params: {dataset: Dataset, sampleSize: number}) => {
      if (!params.dataset) {
        blocklyController.throwError("You must add a dataset for the wind sample.");
        return;
      }
      return {
        data: Datasets.getRandomSampleWithReplacement(params.dataset, params.sampleSize)
      };
    });

    addFunc("getSingleSample", (dataset: Dataset) => {
      if (!dataset) {
        blocklyController.throwError("You must add a dataset for the wind sample.");
        return;
      }
      // Wind data is stored using direction to, but we use direction from. Need to convert.
      const sampleData = (Datasets.getRandomSampleWithReplacement(dataset, 1)[0] as any) as WindDataCase;
      sampleData.direction = sampleData.direction < 180 ? sampleData.direction + 180 : sampleData.direction - 180;
      return {
        data: sampleData
      };
    });

    addFunc("filter", (params: {dataset: Dataset, filter: Filter}) => {
      if (!params.dataset) {
        blocklyController.throwError("You must include a dataset to filter.");
        return;
      }
      if (params.filter) {
        for (const key in params.filter) {
          if ((params.filter[key] as any) === "ERROR") {
            // hard-code for seismic stations
            if (key === "longitude" || key === "latitude") {
              blocklyController.throwError("You can't filter on only one corner for latitude or longitude.\nPlease provide both corners, or leave them empty.");
            } else {
              blocklyController.throwError(`There is an error on the filter key "${key}"`);
            }
            return;
          } else if (key === "direction") {
            // Wind data is stored using direction to, but we use direction from. Need to convert.
              const rotate = (dir: number) => dir < 180 ? dir + 180 : dir - 180;
              if (typeof params.filter.direction === "number") {
                params.filter.direction = rotate(params.filter.direction);
              }
          }
        }
      }
      return {
        data: Datasets.filter(params.dataset, params.filter)
      };
    });

    addFunc("graphSpeedDateScatterPlot", (dataset: Dataset) => {
      if (!dataset) {
        blocklyController.throwError("You must add a dataset for the wind sample.");
        return;
      }
      chartsStore.addDateScatterChart(dataset, "speed", "Wind speed (m/s)");
    });

    addFunc("graphSpeedDirectionRadialPlot", (dataset: Dataset) => {
      if (!dataset) {
        blocklyController.throwError("You must add a dataset for the wind sample.");
        return;
      }
      chartsStore.addDirectionRadialChart(dataset, "speed", "Wind speed (m/s)");
    });

    addFunc("graphArbitraryPlot", (params: {dataset: Dataset, xAxis: string, yAxis: string}) => {
      if (!params.dataset) {
        blocklyController.throwError("You must add a dataset for the wind sample.");
        return;
      }
      chartsStore.addArbitraryChart(params.dataset, params.xAxis, params.yAxis);
    });

    addFunc("graphExceedance", (params: {collection: string, threshold: number}) => {
      const { collection, threshold } = params;
      const samplesCollection = samplesCollectionsStore.samplesCollection(collection);
      if (!samplesCollection) {
        blocklyController.throwError("The samples collection selected is not valid. Make sure you create it first.");
        return;
      }
      chartsStore.addHistogram(samplesCollection, threshold, `Tephra Thickness at ${samplesCollection.name} (mm)`);
    });

    /** ==== Risk level ==== */

    addFunc("showRisk", (params: {collection: string, threshold: number}) => {
      samplesCollectionsStore.setSamplesCollectionRiskLevel(params.collection, params.threshold);
    });

    /** ==== Sample Collections ==== */

    addFunc("createSampleLocation", (params: {name: string, x: number, y: number}) => {
      samplesCollectionsStore.createSamplesLocation(params);
    });

    addFunc("createSampleCollection", (params: {name: string, location: string}) => {
      const samplesLocation = samplesCollectionsStore.samplesLocation(params.location);
      if (!samplesLocation) {
        blocklyController.throwError("The location selected is not valid. Make sure you create it first.");
        return;
      }
      samplesCollectionsStore.createSamplesCollection({name: params.name, location: samplesLocation});
    });

    addFunc("addToSampleCollection", (params: {collection: string, sample: number}) => {
      const samplesCollection = samplesCollectionsStore.samplesCollection(params.collection);
      if (!samplesCollection) {
        blocklyController.throwError("The samples collection selected is not valid. Make sure you create it first.");
        return;
      }
      samplesCollection.addSample(params.sample);
    });

    /** ==== Seismic methods ==== */

    addFunc("getAllGPSStations", () => {
      return {
        data: seismicSimulation.allGPSStations
      };
    });

    addFunc("showGPSStations", (stations: StationData[]) => {
      seismicSimulation.showGPSStations(stations);
    });

    addFunc("showGPSStationVelocities", (show: boolean) => {
      seismicSimulation.setShowVelocityArrows(show);
    });

    addFunc("graphGPSPositions", (params: {station: string, timeRange: ProtoTimeRange}) => {
      const { station, timeRange } = params;
      const fromDate = timeRange.from ? new Date(timeRange.from) : undefined;
      const toDate = timeRange.to ? new Date(timeRange.to) : undefined;

      if (timeRange.from && isNaN(fromDate as any)) {
        blocklyController.throwError("The date in the 'Start' field could not be parsed.\nPlease enter a valid date or a year.");
        return;
      }
      if (timeRange.to && isNaN(toDate as any)) {
        blocklyController.throwError("The date in the 'End' field could not be parsed.\nPlease enter a valid date or a year.");
        return;
      }
      if (fromDate && toDate && timeRange.duration && timeRange.duration > 0) {
        blocklyController.throwError(`You can't include Start and End dates as well as a Duration.\nPlease use at most two fields.`);
        return;
      }

      const validTimeRange: TimeRange = {
        from: fromDate,
        to: toDate,
        duration: timeRange.duration ? timeRange.duration : undefined,
      };
      const dataset = Datasets.getGPSPositionTimeData(station, validTimeRange);
      chartsStore.addArbitraryChart(dataset, "East (mm)", "North (mm)", `${params.station} Position over Time`, true);
    });

    addFunc("computeStrainRate", (filter: Filter) => {
      if (filter) {
        for (const key in filter) {
          if ((filter[key] as any) === "ERROR") {
            blocklyController.throwError("You can't filter on only one corner for latitude or longitude.\nPlease provide both corners, or leave them empty.");
            return;
          }
        }
      }
      seismicSimulation.setStrainMapBounds(filter);
    });

    addFunc("renderStrainRate", (method: ColorMethod) => {
      if (!method) {
        blocklyController.throwError(`You must include a method by which to color the strain map.`);
        return;
      }
      seismicSimulation.setRenderStrainMap(method);
    });

    addFunc("renderStrainRateLabels", () => {
      seismicSimulation.renderStrainRateLabels();
    });

    addFunc("runDeformationModel", () => {
      seismicSimulation.startDeformationModel();
    });

    addFunc("setPlateVelocity", (params: { plate: number, speed: number, direction: number }) => {
      if (Math.abs(params.speed) > Math.abs(seismicSimulation.deformMaxSpeed)) {
        return blocklyController.throwError(`Plate speed must be between ${-seismicSimulation.deformMaxSpeed} and ${seismicSimulation.deformMaxSpeed} mm/year`);
      }
      seismicSimulation.setPlateVelocity(params.plate, params.speed, params.direction);
    });
    /** ==== Utility methods ==== */

    addFunc("log", (params) => {
      console.log(params);
    });

    addFunc("logInfo", (params: any) => {
      if (params) {
        tephraSimulation.logInfo(params);
      }
    });

    addFunc("stringConcat", (params: {lv: any, rv: any}) => {
      return tephraSimulation.stringConcat(params.lv, params.rv);
    });

    /** ==== Used under the hood to control highlighting and stepping ==== */

    addFunc("startStep", (blockId: number) => {
      if (workspace) {
        workspace.highlightBlock(blockId);
      }
      blocklyController.startStep();
    });

    addFunc("endStep", () => {
      blocklyController.endStep();
    });
  };
};

let lastRunID: number | null  = null;
let paused = false;

export interface IInterpreterController {
  step: () => void;
  run: (complete: () => void) => void;
  stop: () => void;
  pause: () => void;
}

export const makeInterpreterController = (code: string, blocklyController: BlocklyController,
                                          store: IStore, workspace: any) => {
  if (lastRunID) {
    window.clearTimeout(lastRunID);
  }
  const interpreter = new Interpreter(code, makeInterpreterFunc(blocklyController, store, workspace));
  const step = () => {
    interpreter.step();
  };

  const run = (complete: () => void) => {
    if (lastRunID) return;

    // If we're running at slow speed (ui.speed === 0), we will call interpreter.step() with a
    // 10ms setTimeout.
    // If we're running at fast speed (ui.speed > 0), we will call interpreter.step() numerous
    // times synchronously, but we must still occasionally call it asynchronously with 0ms setTimeout,
    // or (1) the blocks won't flash, as control will never pass to the renderer, and (2) the React
    // views won't update.
    const timeout = store.uiStore.speed > 0 ? 0 : 10;
    const skip = store.uiStore.speed === 0 ? 1 :
                  store.uiStore.speed === 1 ? 2 :
                  store.uiStore.speed === 2 ? 6 : 20;
    let stepCount = 0;
    paused = false;
    function runLoop() {
      if (paused) {
        lastRunID = null;
        return;
      }
      stepCount++;
      if (interpreter.step()) {
        if (stepCount % skip === 0) {
          lastRunID = window.setTimeout(() => runLoop(), timeout);
        } else {
          runLoop();
        }
      }
      else {
        lastRunID = null;
        complete();
      }
    }
    runLoop();
  };

  const stop = () => {
    if (lastRunID) {
      window.clearTimeout(lastRunID);
      lastRunID = null;
    }
  };

  const pause = () => {
    paused = true;
  };

  const intepreterController: IInterpreterController = {
    step,
    run,
    stop,
    pause
  };

  return intepreterController;
};
