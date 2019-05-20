import { types } from "mobx-state-tree";
import { autorun } from "mobx";
import * as Color from "color";
import gridTephraCalc from "../tephra2";
import { IInterpreterController, makeInterpreterController } from "../utilities/interpreter";
import { SimulationAuthoringOptions } from "../components/app";

let _cityCounter = 0;
const genCityId = () => `city_${_cityCounter++}`;
let interpreterController: IInterpreterController | null;
let cachedBlocklyWorkspace: {highlightBlock: (id: string|null) => void};

export interface IModelParams {
  mass: number;
  windSpeed: number;
  colHeight: number;
  particleSize: number;
  windDirection: number;
  volcanoX: number;
  volcanoY: number;
  isErupting: boolean;
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

export type SimOutput = "thickness";

export const City = types
  .model("City", {
    id: types.identifier,
    name: types.string,
    x: types.number,
    y: types.number
  });

export function getGridIndexForLocation(x: number, y: number, numRows: number) {
  return y + x * numRows;
}

export const SimulationStore = types
  .model("simulation", {
    numRows: 14,
    numCols: 14,
    windSpeed: 6,
    windDirection: 45,
    mass: 20000000,
    colHeight: 2000,
    particleSize: 1,
    volcanoX: 5,
    volcanoY: 5,
    cities: types.array(City),
    code: "",
    data: types.array(SimDatum),
    gridColors: types.array(types.string),
    isErupting: false,
    // authoring props
    requireEruption: true,
    requirePainting: true,
  })
  .volatile(self => ({
    running: false,
    steppingThroughBlock: false,
  }))
  .actions((self) => ({
    endEruption() {
      self.isErupting = false;
    }
  }))
  .actions((self) => ({
    setBlocklyCode(code: string, workspace: any) {
      self.code = code;
      if (interpreterController) {
        interpreterController.stop();
        workspace.highlightBlock(null);
      }
      self.running = false;
      cachedBlocklyWorkspace = workspace;
      interpreterController = makeInterpreterController(code, simulation, workspace);
    },
    run() {
      const reset = () => {
        this.setBlocklyCode(self.code, cachedBlocklyWorkspace);
      };
      if (interpreterController) {
        interpreterController.run(reset);
        self.running = true;
      }
    },
    reset() {
      this.setBlocklyCode(self.code, cachedBlocklyWorkspace);
      self.isErupting = false;
    },
    stop() {
      if (interpreterController) {
        interpreterController.stop();
        self.running = false;
      }
      self.isErupting = false;
    },
    // pauses the interpreter run without setting self.running = false
    pause() {
      if (interpreterController) {
        interpreterController.pause();
      }
    },
    // only restarts if self.running = true. If user hit stop between `pause` and this
    // function, this won't restart the run.
    unpause() {
      if (interpreterController && self.running) {
        const reset = () => {
          this.setBlocklyCode(self.code, cachedBlocklyWorkspace);
        };
        interpreterController.run(reset);
      }
    },
    /**
     * Steps through one complete block.
     * This sets steppingThroughBlock to true, and then repeatedly calls `step` on the interpreter
     * until steppingThroughBlock is false. All blocks are wrapped with code that will call endStep
     * at the end of the block's function, which will set steppingThroughBlock to false.
     */
    step() {
      self.steppingThroughBlock = true;

      // guard against infinite loops or a block failing to call endStep
      const maxInvocations = 100;
      let invocations = 0;

      function stepAsync() {
        if (interpreterController) {
          interpreterController.step();
        }
        if (self.steppingThroughBlock && invocations++ < maxInvocations) {
          setTimeout(stepAsync, 0); // async to allow endStep to be called
        }
      }
      stepAsync();
    },
    startStep() {
      // turn off animation at beginning of next block
      self.endEruption();
    },
    endStep() {
      self.steppingThroughBlock = false;
    }
  }))
  .actions((self) => ({
    paintGrid(resultType: SimOutput, colorStr: string) {
      self.gridColors.clear();
      const baseColor = Color(colorStr).hsl();
      self.data.forEach(datum => {
        const val: number = datum[resultType];
        // Need to think of how to handle scaling.
        // Note: toFixed is used because of https://github.com/Qix-/color/issues/156
        const alpha = Math.min(Number.parseFloat(val.toFixed(2)), 1);
        const gridColor = Color(baseColor).alpha(alpha);
        self.gridColors.push(gridColor.toString());
      });
    },
    clearGrid() {
      self.gridColors.clear();
    }
  }))
  .actions((self) => ({
    erupt(animate = false) {
      const rows = self.numRows;
      const cols = self.numCols;
      const vX = self.volcanoX;
      const vY = self.volcanoY;
      self.data.clear();
      for (let x = 0; x < rows; x ++) {
        for (let y = 0; y < cols; y++) {
          const simResults = gridTephraCalc(
            x, y, vX, vY,
            self.windSpeed,
            self.windDirection,
            self.colHeight,
            self.mass,
            self.particleSize
          );
          self.data[getGridIndexForLocation(x, y, rows)] = {thickness: simResults};
        }
      }

      // auto-repaint if necessary
      if (!self.requirePainting) {
        self.paintGrid("thickness", "#ff0000");
      }

      // will be used when we add animations
      if (animate) {
        self.clearGrid();
        self.isErupting = true;
        self.pause();

        // if user hit run button, this stop lasts 3000 ms
        if (self.running) {
          setTimeout(self.unpause, 3000);
        }
      }
    },
  }))
  .actions((self) => {
    return {
      setWindSpeed(speed: number) {
        self.windSpeed = speed;
        // auto-erupt to recalculate data
        if (!self.requireEruption) {
          self.erupt();
        }
      },
      setVolcanoX(x: number) {
        self.volcanoX = x;
      },
      setVolcanoY(y: number) {
        self.volcanoY = y;
      },
      setColumnHeight(height: number) {
        self.colHeight = height;
        if (!self.requireEruption) {
          self.erupt();
        }
      },
      setMass(mass: number) {
        self.mass = mass;
        if (!self.requireEruption) {
          self.erupt();
        }
      },
      setVEI(vei: number) {
        const clippedVEI = Math.max(0, Math.min(vei, 8));
        // for now this is just setting the mass
        // we want vei 1 = 1e8, vei 8 = 1e15
        const mass = Math.pow(10, clippedVEI + 7);
        self.mass = mass;
        if (!self.requireEruption) {
          self.erupt();
        }
      },
      setParticleSize(size: number) {
        self.particleSize = size;
        if (!self.requireEruption) {
          self.erupt();
        }
      },
      setWindDirection(direction: number) {
        self.windDirection = direction;
        if (!self.requireEruption) {
          self.erupt();
        }
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
      setAuthoringOptions(opts: SimulationAuthoringOptions) {
        self.requireEruption = opts.requireEruption;
        self.requirePainting = opts.requirePainting;
      }
    };
  })
  .views((self) => {
    return {
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
