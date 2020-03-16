import { IModelParams, SimOutput, SimulationVariable, SimulationStore } from "../stores/simulation-store";
import { BlocklyController } from "./blockly-controller";
import { SimulationModelType } from "../stores/simulation-store";
import { IBlocklyWorkspace } from "../interfaces";
import { IStore } from "../stores/stores";
import { Datasets, Dataset, Filter } from "../stores/data-sets";
const Interpreter = require("js-interpreter");

const makeInterpreterFunc = (blocklyController: BlocklyController, store: IStore,
                             workspace: IBlocklyWorkspace) => {

  const { simulation, chartsStore, samplesCollectionsStore } = store;

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

    addFunc("setModelParams", (params: IModelParams) => {
      simulation.setModelParams(params);
    });
    addFunc("setWindDirection", (direction: number) => {
      if (direction === undefined) {
        blocklyController.throwError("You must set a value for the wind direction.");
        return;
      }
      simulation.setWindDirection(direction);
    });

    addFunc("setWindspeed", (speed: number) => {
      if (speed === undefined) {
        blocklyController.throwError("You must set a value for the wind speed.");
        return;
      }
      simulation.setWindSpeed(speed);
    });

    addFunc("setWindspeedAndDirection", (windSample?: any) => {
      if (windSample) {
        simulation.setWindSpeed(windSample.speed);
        simulation.setWindDirection(windSample.direction);
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
      simulation.setMass(mass);
    });

    addFunc("setVolume", (volume: number) => {
      if (volume === undefined) {
        blocklyController.throwError("You must set a value for the eruption volume.");
        return;
      }
      // +9 km^3 to m^3, +3 m^3 to kg
      const massInKilograms = volume * Math.pow(10, 9 + 3);
      simulation.setMass(massInKilograms);
    });

    addFunc("setVEI", (vei: number) => {
      if (vei === undefined) {
        blocklyController.throwError("You must set a value for the eruption VEI.");
        return;
      }
      simulation.setVEI(vei);
    });

    addFunc("setColumnHeight", (height: number) => {
      if (height === undefined) {
        blocklyController.throwError("You must set a value for the eruption column height.");
        return;
      }
      simulation.setColumnHeight(height);
    });

    addFunc("setVolcano", (params: {x: number, y: number}) => {
      simulation.setVolcano(params.x, params.y);
    });

    /** ==== Run tephra simulation model ==== */

    addFunc("erupt", () => {
      simulation.erupt();
    });

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

      const samplesCollection = samplesCollectionsStore.samplesCollection(collection);
      if (!samplesCollection) {
        blocklyController.throwError("The samples collection selected is not valid. Make sure you create it first.");
        return;
      }

      const VEI = vei;
      let windSpeed = 0;
      let windDirection = 0;
      if (windSamples && windSamples.length > 0) {
        const windSample = Datasets.getRandomSampleWithReplacement(windSamples, 1)[0];
        windSpeed = windSample.speed;
        windDirection = windSample.direction;
      }
      simulation.setWindSpeed(windSpeed);
      simulation.setWindDirection(windDirection);
      simulation.setVEI(VEI);

      const thickness = simulation.calculateTephraAtLocation(samplesCollection.x, samplesCollection.y);

      return {
        data: thickness
      };
    });

    /** ==== Draw on tephra map ==== */

    addFunc("paintMap", () => {
      simulation.paintMap();
    });

    addFunc("addCity", (params: {x: number, y: number, name: string}) => {
      simulation.addCity(params.x, params.y, params.name);
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
      return {
        data: Datasets.getRandomSampleWithReplacement(dataset, 1)[0]
      };
    });

    addFunc("filter", (params: {dataset: Dataset, filter: Filter}) => {
      if (!params.dataset) {
        blocklyController.throwError("You must add a dataset for the wind sample.");
        return;
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

    addFunc("graphExceedance", (params: {location: string, threshold: number}) => {
      const { location, threshold } = params;
      const samplesCollection = samplesCollectionsStore.samplesCollection(location);
      if (!samplesCollection) {
        blocklyController.throwError("The samples collection selected is not valid. Make sure you create it first.");
        return;
      }
      chartsStore.addHistogram(samplesCollection, threshold, `Tephra Thickness at ${samplesCollection.name} (mm)`);
    });

    /** ==== Risk level ==== */

    addFunc("showRisk", (params: {location: string, threshold: number}) => {
      samplesCollectionsStore.setSamplesCollectionRiskLevel(params.location, params.threshold);
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

    addFunc("addToSampleCollection", (params: {name: string, sample: number}) => {
      const samplesCollection = samplesCollectionsStore.samplesCollection(params.name);
      if (!samplesCollection) {
        blocklyController.throwError("The samples collection selected is not valid. Make sure you create it first.");
        return;
      }
      samplesCollection.addSample(params.sample);
    });

    /** ==== Utility methods ==== */

    addFunc("log", (params) => {
      console.log(params);
    });

    addFunc("logInfo", (params: any) => {
      if (params) {
        simulation.logInfo(params);
      }
    });

    addFunc("stringConcat", (params: {lv: any, rv: any}) => {
      return simulation.stringConcat(params.lv, params.rv);
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
