import { types } from "mobx-state-tree";
import { autorun } from "mobx";
import gridTephraCalc from "../tephra2";
import { evalCode } from "../utilities/interpreter";

let _cityCounter = 0;
const genCityId = () => `city_${_cityCounter++}`;

export interface IModelParams {
  mass: number;
  windSpeed: number;
  colHeight: number;
  particleSize: number;
  windDirection: number;
  volcanoX: number;
  volcanoY: number;
}

export const SimDatum = types
  .model("SimDatum", {
    thickness: types.number
  });

export interface SimDatumType {
  thickness: number;
}
export const City = types
  .model("City", {
    id: types.identifier,
    name: types.string,
    x: types.number,
    y: types.number
  });

export const SimulationModel = types
  .model("simulation", {
    numRows: 10,
    numCols: 10,
    windSpeed: 0,
    windDirection: 0,
    mass: 2000,
    colHeight: 2000,
    particleSize: 1,
    volcanoX: 5,
    volcanoY: 5,
    cities: types.array(City),
    code: ";"
  })
  .actions((self) => {
    return {
      setWindSpeed(speed: number) {
        self.windSpeed = speed;
        console.log(`Set windspeed to ${self.windSpeed}`);
      },
      setVolcanoX(x: number) {
        self.volcanoX = x;
        console.log(`Set volcanoX to ${self.volcanoX}`);
      },
      setVolcanoY(y: number) {
        self.volcanoY = y;
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
      setBlocklyCode(code: string) {
        self.code = code;
      },
      setModelParams(params: IModelParams) {
        self.windSpeed = params.windSpeed;
        self.colHeight = params.colHeight;
        self.mass = params.mass;
        self.particleSize = params.particleSize;
        self.windDirection = params.windDirection;
      },
      setVolcano(x: number, y: number) {
        self.volcanoX = x;
        self.volcanoY = y;
      },
      addCity(x: number, y: number, name: string) {
        const found = self.cities.find( c => {
          if (c.name === name) { return true; }
          if (c.x === x && c.y === y){ return true; }
          return false;
        });
        if (found) {
          found.name = name;
          found.x = x;
          found.y = y;
          console.log(`found a city with ${name}`);
        }
        else {
          self.cities.push(City.create({id: genCityId(), name, x, y}));
          console.log(`created a city with ${name}`);
        }

      },
      run() {
        evalCode(self.code, self);
      }
    };
  })
  .views((self) => {
    return {
      get data() {
        const rows = self.numRows;
        const cols = self.numCols;
        const vX = self.volcanoX;
        const vY = self.volcanoY;
        const resultData: SimDatumType[] = [];
        for (let x = 0; x < rows; x ++) {
          for (let y = 0; y < cols; y++) {
            const simResults = gridTephraCalc(
              x, y, vX, vY,
              self.windSpeed,
              self.colHeight,
              self.mass,
              self.particleSize
            );
            resultData.push( {thickness: simResults});
          }
        }
        return resultData;
      },
      get cityHash() {
        return self.cities.reduce( (pre, cur) => `${pre}-${cur.id}`, "");
      }
    };
  });
export const simulation = SimulationModel.create({});

autorun(() => {
  const {windSpeed, windDirection, code, cities } = simulation;
  const x = windSpeed * Math.cos(windDirection);
  const y = windSpeed * Math.sin(windDirection);
  const vx = simulation.volcanoX;
  evalCode(code, simulation);
  const cityHash = cities.reduce( (pre, current) => `${pre}-${current.name}`, "");
  console.log(cityHash);
  console.log(`AUTO RUN RAN ${vx} --------------------------- `);
});

export type SimulationModelType = typeof SimulationModel.Type;
export type CityType = typeof City.Type;
