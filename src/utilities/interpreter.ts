import { IModelParams } from "../models/volcano-store";
// import { Interpreter } from "js-interpreter";
import { simulation } from "../models/volcano-store";
const Interpreter = require("js-interpreter");

const handleError = (interpreter: any) => {
  console.log(`exception in code: [TODO]`);
};

const interpreterInitFunc = (interpreter: any, scope: any) => {
  const addVar = (name: string, value: any) => {
    interpreter.setProperty(scope, name, value);
  };

  const addFunc = (name: string, func: (args: any) => any) => {
    const wrapped = interpreter.createNativeFunction(func);
    addVar(name, wrapped);
  };

  addFunc("setModelParams", simulation.setModelParams);
};

export const evalCode = (code: string) => {
  const interpreter = new Interpreter(code, interpreterInitFunc);
  const nextStep = () => {
    if (interpreter.step()) {
      window.setTimeout(nextStep, 10);
    }
    else {
      handleError(interpreter);
    }
  };

  nextStep();
};

