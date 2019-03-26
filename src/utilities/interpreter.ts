import { IModelParams } from "../models/volcano-store";
// import { Interpreter } from "js-interpreter";
import { simulation } from "../models/volcano-store";
const Interpreter = require("js-interpreter");

const interpreterInitFunc = (interpreter: any, scope: any) => {
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
};

export const evalCode = (code: string) => {
  const interpreter = new Interpreter(code, interpreterInitFunc);
  const nextStep = () => {
    if (interpreter.step()) {
      window.setTimeout(nextStep, 10);
    }
  };

  nextStep();
};
