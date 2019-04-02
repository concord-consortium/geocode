import { IModelParams } from "../models/volcano-store";

// import { Interpreter } from "js-interpreter";
import { SimulationModelType } from "../models/volcano-store";
const Interpreter = require("js-interpreter");

const makeInterperterFunc = (simulation: SimulationModelType) => {
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

    addFunc("setVolcano", (...args) => {
      const params = (unwrap(args)[0]) as {x: number, y: number};
      simulation.setVolcano(params.x, params.y);
    });

    addFunc("log", (...args) => {
      console.log(unwrap(args));
    });
  };
};

let lastRunID: number | null  = null;

export const evalCode = (code: string, store: any) => {
  if (lastRunID) {
    window.clearTimeout(lastRunID);
  }
  const interpreter = new Interpreter(code, makeInterperterFunc(store));
  const nextStep = () => {
    if (interpreter.step()) {
      lastRunID = window.setTimeout(nextStep, 10);
    }
  };
  nextStep();
};
