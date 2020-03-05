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
      simulation.setWindDirection(direction);
    });

    addFunc("setWindspeed", (speed: number) => {
      simulation.setWindSpeed(speed);
    });

    addFunc("setMass", (mass: number) => {
      simulation.setMass(mass);
    });

    addFunc("setVolume", (volume: number) => {
      // +9 km^3 to m^3, +3 m^3 to kg
      const massInKilograms = volume * Math.pow(10, 9 + 3);
      simulation.setMass(massInKilograms);
    });

    addFunc("setVEI", (vei: number) => {
      simulation.setVEI(vei);
    });

    addFunc("setColumnHeight", (height: number) => {
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
    addFunc("computeTephra", (params: {collection: string, windSamples?: Dataset, vei?: number}) => {
      const { collection, windSamples, vei } = params;

      const samplesCollection = samplesCollectionsStore.samplesCollection(collection);
      if (!samplesCollection) {
        return {
          data: 0       // ought to stop and throw an error to the user
        };
      }

      const VEI = vei || 1;
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
      return {
        data: Datasets.getRandomSampleWithReplacement(params.dataset, params.sampleSize)
      };
    });

    addFunc("filter", (params: {dataset: Dataset, filter: Filter}) => {
      return {
        data: Datasets.filter(params.dataset, params.filter)
      };
    });

    addFunc("graphSpeedDateScatterPlot", (dataset: Dataset) => {
      chartsStore.addDateScatterChart(dataset, "speed", "Wind speed");
    });

    addFunc("graphSpeedDirectionRadialPlot", (dataset: Dataset) => {
      chartsStore.addDirectionRadialChart(dataset, "speed", "Wind speed");
    });

    addFunc("graphArbitraryPlot", (params: {dataset: Dataset, xAxis: string, yAxis: string}) => {
      chartsStore.addArbitraryChart(params.dataset, params.xAxis, params.yAxis);
    });

    addFunc("graphExceedance", (params: {location: string, threshold: number}) => {
      const { location, threshold } = params;
      const samplesCollection = samplesCollectionsStore.samplesCollection(location);
      if (!samplesCollection) {
        return;
      }
      chartsStore.addHistogram(samplesCollection, threshold, `Tephra Thickness at ${samplesCollection.name} (mm)`);
    });

    /** ==== Sample Collections ==== */

    addFunc("createSampleCollection", (params: {name: string, x: number, y: number}) => {
      samplesCollectionsStore.createSamplesCollection(params);
    });

    addFunc("addToSampleCollection", (params: {name: string, sample: number}) => {
      samplesCollectionsStore.addToSamplesCollection(params.name, params.sample);
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
    paused = false;
    function runLoop() {
      if (paused) return;
      if (interpreter.step()) {
        lastRunID = window.setTimeout(() => runLoop(), 10);
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
