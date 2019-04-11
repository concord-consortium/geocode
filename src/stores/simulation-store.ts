import { types } from "mobx-state-tree";
import { autorun } from "mobx";
import gridTephraCalc from "../tephra2";
import { IInterpreter, makeInterpreter } from "../utilities/interpreter";

let _cityCounter = 0;
const genCityId = () => `city_${_cityCounter++}`;
let interpreter: IInterpreter | null;
let cachedBlocklyWorkspace: {highlightBlock: (id: string|null) => void};

export interface IModelParams {
  mass: number;
  windSpeed: number;
  colHeight: number;
  particleSize: number;
  windDirection: number;
  volcanoX: number;
  volcanoY: number;
}

// This is a bit silly at the moment because our model only outputs one value:
// the tephra thickness. Originally we also had median grain-size.
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

export const SimulationStore = types
  .model("simulation", {
    numRows: 14,
    numCols: 14,
    windSpeed: 0,
    windDirection: 0,
    mass: 2000,
    colHeight: 2000,
    particleSize: 1,
    volcanoX: 5,
    volcanoY: 5,
    cities: types.array(City),
    code: "",
    running: false
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
      setBlocklyCode(code: string, workspace: any) {
        self.code = code;
        if (interpreter) {
          interpreter.stop();
          workspace.highlightBlock(null);
        }
        self.running = false;
        cachedBlocklyWorkspace = workspace;
        interpreter = makeInterpreter(code, simulation, workspace);
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
        }
        else {
          self.cities.push(City.create({id: genCityId(), name, x, y}));
        }

      },
      run() {
        const reset = () => {
          this.setBlocklyCode(self.code, cachedBlocklyWorkspace);
        };
        if (interpreter) {
          interpreter.run(reset);
          self.running = true;
        }
      },
      reset() {
        this.setBlocklyCode(self.code, cachedBlocklyWorkspace);
      },
      stop() {
        if (interpreter) {
          interpreter.stop();
          self.running = false;
        }
      },
      step() {
        if (interpreter) {
          interpreter.step();
        }
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
        return self.cities.reduce( (pre, cur) => `${pre}-${cur.name}${cur.x}${cur.y}`, "");
      }
    };
  });
export const simulation = SimulationStore.create({});

autorun(() => {
  const {windSpeed, windDirection, code, cities } = simulation;
  const x = windSpeed * Math.cos(windDirection);
  const y = windSpeed * Math.sin(windDirection);
  const vx = simulation.volcanoX;
});

export type SimulationModelType = typeof SimulationStore.Type;
export type CityType = typeof City.Type;
