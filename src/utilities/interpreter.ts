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
      const wrapped = interpreter.createNativeFunction(func);
      addVar(name, wrapped);
    };

    addFunc("setModelParams", (...args) => {
      const params = (unwrap(args)[0]) as any;
      simulation.setModelParams(params as IModelParams);
    });

    addFunc("setWindspeed", (...args) => {
      const params = (unwrap(args)[0]);
      simulation.setWindSpeed(params);
    });

    addFunc("setMass", (...args) => {
      const params = (unwrap(args)[0]);
      simulation.setMass(params);
    });

    addFunc("setVolcano", (...args) => {
      const params = (unwrap(args)[0]) as {x: number, y: number};
      simulation.setVolcano(params.x, params.y);
    });

    addFunc("addCity", (...args) => {
      const params = (unwrap(args)[0]) as {x: number, y: number, name: string};
      simulation.addCity(params.x, params.y, params.name);
    });

    addFunc("log", (...args) => {
      console.log(unwrap(args));
    });

    addFunc("highlightBlock", (...args) => {
      const id = (unwrap(args)[0] as number);
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
