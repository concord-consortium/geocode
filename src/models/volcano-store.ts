import { types } from "mobx-state-tree";
import { autorun } from "mobx";
import Volcano from "../volcano";

const volcano = new Volcano(null);

export const SimulationModel = types
  .model("simulation", {
    windSpeed: 0,
    windDirection: 0,
    mass: 2000,
    colHeight: 2000,
    particleSize: 1,
    code: ";"
  })
  .actions((self) => {
    return {
      setWindSpeed(speed: number) {
        self.windSpeed = speed;
      },
      setColumnHeight(height: number) {
        self.colHeight = height;
      },
      setMass(mass: number) {
        self.mass = mass;
      },
      setParticleSize(size: number) {
        self.particleSize = size;
      },
      setWindDirection(direction: number) {
        self.windDirection = direction;
      },
      setCanvas(canvas: HTMLCanvasElement) {
        volcano.setCanvas(canvas);
        volcano.run();
      },
      setBlocklyCode(code: string) {
        self.code = code;
        volcano.setBlocklyCode(code);
      }
    };
  });

export const simulation = SimulationModel.create({});

autorun(() => {
  const {windSpeed, windDirection, colHeight, code } = simulation;
  const x = windSpeed * Math.cos(windDirection);
  const y = windSpeed * Math.sin(windDirection);
  volcano.wind.x = x;
  volcano.wind.y = y;
  volcano.run();
  console.log(simulation.colHeight);
});

export type SimulationModelType = typeof SimulationModel.Type;
