import { types } from "mobx-state-tree";
import { autorun } from "mobx";
import Volcano from "../volcano";

const volcano = new Volcano(null);

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
      },
      setCanvas(canvas: HTMLCanvasElement) {
        volcano.setCanvas(canvas);
        volcano.run();
      }
    };
  });

export const simulation = SimulationModel.create({});

autorun(() => {
  const {windSpeed, windDirection } = simulation;
  const x = windSpeed * Math.cos(windDirection);
  const y = windSpeed * Math.sin(windDirection);
  volcano.wind.x = x;
  volcano.wind.y = y;
  volcano.run();
});

export type SimulationModelType = typeof SimulationModel.Type;
