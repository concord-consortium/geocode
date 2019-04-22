import { IModelParams } from "../stores/simulation-store";

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
        if (a.data) {return a.data; }
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
        func(params);
      };
      const wrapped = interpreter.createNativeFunction(unwrappingFunction);
      addVar(name, wrapped);
    };

    addFunc("setModelParams", (params: IModelParams) => {
      simulation.setModelParams(params);
    });

    addFunc("erupt", () => {
      simulation.erupt();
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

    addFunc("setVolcano", (params: {x: number, y: number}) => {
      simulation.setVolcano(params.x, params.y);
    });

    addFunc("addCity", (params: {x: number, y: number, name: string}) => {
      simulation.addCity(params.x, params.y, params.name);
    });

    addFunc("log", (params) => {
      console.log(params);
    });

    addFunc("highlightBlock", (id: number) => {
      if (workspace) {
        workspace.highlightBlock(id);
      }
    });
  };
};

let lastRunID: number | null  = null;

export interface IInterpreter {
  step: () => void;
  run: (complete: () => void) => void;
  stop: () => void;
}

export const makeInterpreter = (code: string, store: any, workspace: any) => {
  if (lastRunID) {
    window.clearTimeout(lastRunID);
  }
  const interpreter = new Interpreter(code, makeInterperterFunc(store, workspace));
  const step = () => {
    console.log("step");
    window.setTimeout(() => interpreter.step(), 10);
  };

  const run = (complete: () => void) => {
    if (interpreter.step()) {
      lastRunID = window.setTimeout(() => run(complete), 10);
    }
    else {
      complete();
    }
  };

  const stop = () => {
    if (lastRunID) {
      window.clearTimeout(lastRunID);
      lastRunID = null;
    }
  };

  return {
    step,
    run,
    stop
  };
};
