import {  types } from "mobx-state-tree";
import { autorun } from "mobx";

export const SimulationModel = types
  .model("simulation", {
    windSpeed: 0,
    windDirection: 0,
    explosiveForce: 0
  })
  .actions((self) => {
    return {
      setWindSpeed(speed: number) {
        self.windSpeed = speed;
      },
      setWindDirection(direction: number) {
        self.windDirection = direction;
      }
    };
  });

export type SimulationModelType = typeof SimulationModel.Type;

export interface IStores {
  simulation: SimulationModelType;
}

export interface ICreateStores {
  simulation?: SimulationModelType;
}

export function createStores(params?: ICreateStores): IStores {
  return {
    simulation: params && params.simulation || SimulationModel.create({})
  };
}
autorun(() => {
  console.log(SimulationModel);
});

