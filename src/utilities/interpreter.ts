import { IModelParams, SimOutput, SimulationVariable } from "../stores/simulation-store";

// import { Interpreter } from "js-interpreter";
import { SimulationModelType } from "../stores/simulation-store";
import { IBlocklyWorkspace } from "../interfaces";
const Interpreter = require("js-interpreter");

const makeInterperterFunc = (simulation: SimulationModelType, workspace: IBlocklyWorkspace) => {
  return (interpreter: any, scope: any) => {
    const addVar = (name: string, value: any) => {
      interpreter.setProperty(scope, name, value);
    };

    const unwrap = (args: any[]) => {
      const modifiedArgs = args.map( (a) => {
        if (a.data !== undefined && a.data !== null) {return a.data; }
        if (a.properties) {
          const returnObject: { [key: string]: any } = {};
          const keys = Object.keys(a.properties);
          keys.forEach( (k) => {
            returnObject[k] = a.properties[k].data;
          });
          return returnObject;
        }
      });
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

    addFunc("setModelParams", (params: IModelParams) => {
      simulation.setModelParams(params);
    });

    addFunc("erupt", (animate: boolean) => {
      simulation.erupt(animate);
    });

    addFunc("setWinddirection", (direction: number) => {
      simulation.setWindDirection(direction);
    });

    addFunc("setWindspeed", (speed: number) => {
      simulation.setWindSpeed(speed);
    });

    addFunc("setMass", (mass: number) => {
      simulation.setMass(mass);
    });

    addFunc("setVEI", (vei: number) => {
      simulation.setVEI(vei);
    });

    addFunc("setVolcano", (params: {x: number, y: number}) => {
      simulation.setVolcano(params.x, params.y);
    });

    addFunc("addCity", (params: {x: number, y: number, name: string}) => {
      simulation.addCity(params.x, params.y, params.name);
    });

    addFunc("paintGrid", (params: {resultType: SimOutput, color: string}) => {
      simulation.paintGrid(params.resultType, params.color);
    });

    addFunc("calculateAndAddPlotPoint", (params: {xData: SimulationVariable, yData: SimOutput, cityName: string}) => {
      simulation.calculateAndAddPlotPoint(params.xData, params.yData, params.cityName);
    });

    addFunc("log", (params) => {
      console.log(params);
    });

    addFunc("logInfo", (params: any) => {
      if (params) {
        // console.log(params);
        simulation.logInfo(params);
      }
    });

    addFunc("stringConcat", (params: {lv: any, rv: any}) => {
      // console.log(params.lv + " " + params.rv);
      return simulation.stringConcat(params.lv, params.rv);
    });

    addFunc("startStep", (blockId: number) => {
      if (workspace) {
        workspace.highlightBlock(blockId);
      }
      simulation.startStep();
    });

    addFunc("endStep", () => {
      simulation.endStep();
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

export const makeInterpreterController = (code: string, store: any, workspace: any) => {
  if (lastRunID) {
    window.clearTimeout(lastRunID);
  }
  const interpreter = new Interpreter(code, makeInterperterFunc(store, workspace));
  const step = () => {
    interpreter.step();
  };

  const run = (complete: () => void) => {
    paused = false;
    function runLoop() {
      if (paused) return;
      if (interpreter.step()) {
        lastRunID = window.setTimeout(() => runLoop(), 10);
      }
      else {
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
