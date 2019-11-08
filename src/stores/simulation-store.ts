import { types, getSnapshot } from "mobx-state-tree";
import { IInterpreterController, makeInterpreterController } from "../utilities/interpreter";
import { kVEIIndexInfo } from "../utilities/vei";
import { SimulationAuthorSettings, SimulationAuthorSettingsProps } from "./stores";

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
  volcanoLat: number;
  volcanoLng: number;
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
export type SimulationVariable = "windSpeed" | "windDirection" | "colHeight" | "mass" | "vei";

const MeasurementLabel: {[key in (SimOutput | SimulationVariable)]: string} = {
  thickness: "Thickness (mm)",
  windSpeed: "Wind speed (m/s)",
  windDirection: "Wind direction (degrees)",
  mass: "Eruption mass (kg)",
  colHeight: "Column height (km)",
  vei: "VEI"
};

export const PlotData = types
  .model("PlotData", {
    xAxis: "",
    yAxis: "",
    points: types.array(types.array(types.number))    // [[x,y], [x,y], ...]
  })
  .actions((self) => ({
    setXAxis(xAxis: string) {
      if (xAxis !== self.xAxis) {
        self.points.clear();
      }
      self.xAxis = xAxis;
    },
    setYAxis(yAxis: string) {
      if (yAxis !== self.yAxis) {
        self.points.clear();
      }
      self.yAxis = yAxis;
    },
  }))
  .views((self) => ({
    get chartData() {
      return self.points
        .sort((a, b) => a[0] - b[0])
        .map(xy => ({
          [self.xAxis]: xy[0],
          [self.yAxis]: xy[1]
        }));
    }
  }));
const plotData = PlotData.create({});

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
    windSpeed: 6,
    windDirection: 0,    // from north
    mass: 10000000000000,
    vei: 1,
    colHeight: 20000,      // meters
    particleSize: 1,
    stagingWindSpeed: 6,
    stagingWindDirection: 0,
    stagingMass: 10000000000000,
    stagingVei: 1,
    stagingColHeight: 20000,
    stagingParticleSize: 1,
    coloredWindSpeed: 6,
    coloredWindDirection: 0,
    coloredMass: 10000000000000,
    coloredVei: 1,
    coloredColHeight: 20000,
    coloredParticleSize: 1,
    volcanoLat: 0,
    volcanoLng: 0,
    crossPoint1Lat: 0,
    crossPoint1Lng: 0,
    crossPoint2Lat: 0,
    crossPoint2Lng: 0,
    viewportZoom: 8,
    viewportCenterLat: 0,
    viewportCenterLng: 0,
    cities: types.array(City),
    code: "",                   // current blockly JS code
    xmlCode: "",                // current blockly xml code
    initialXmlCode: "",         // initial blockly xml code
    log: "",
    plotData: types.optional(PlotData, getSnapshot(plotData)),
    isErupting: false,
    hasErupted: false,
    isSelectingRuler: false,
    isSelectingCrossSection: false,
    // authoring props
    requireEruption: true,
    requirePainting: true,
    scenario: "Cerro Negro",
    toolbox: "Everything",
    initialCodeTitle: "Basic",
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
    rulerClick() {
      self.isSelectingRuler = !self.isSelectingRuler;
      self.isSelectingCrossSection = false;
    },
    crossSectionClick() {
      self.isSelectingCrossSection = !self.isSelectingCrossSection;
      self.isSelectingRuler = false;
    },
    setIsSelectingRuler(val: boolean) {
      self.isSelectingRuler = val;
    },
    setIsSelectingCrossSection(val: boolean) {
      self.isSelectingCrossSection = val;
    }
  }))
  .actions((self) => ({
    setBlocklyCode(code: string, workspace: any) {
      self.code = code;
      self.xmlCode = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(workspace));

      if (interpreterController) {
        interpreterController.stop();
        workspace.highlightBlock(null);
      }
      self.running = false;
      cachedBlocklyWorkspace = workspace;
      interpreterController = makeInterpreterController(code, simulation, workspace);
    },
    setInitialXmlCode(xmlCode: string) {
      self.initialXmlCode = xmlCode;
    },
    setViewportParameters(zoom: number, viewportCenterLat: number, viewportCenterLng: number) {
      self.viewportZoom = zoom;
      self.viewportCenterLat = viewportCenterLat;
      self.viewportCenterLng = viewportCenterLng;
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
      self.hasErupted = false;
      self.log = "";
      self.plotData = PlotData.create({});
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
    clearLog() {
      self.log = "";
    },
    setPoint1Pos(lat: number, lng: number) {
      self.crossPoint1Lat = lat;
      self.crossPoint1Lng = lng;
    },
    setPoint2Pos(lat: number, lng: number) {
      self.crossPoint2Lat = lat;
      self.crossPoint2Lng = lng;
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
      console.warn("WARNING: Painting Grid is no longer supported");
      self.hasErupted = true;
    },
    paintMap() {
      self.hasErupted = true;
      self.coloredColHeight = self.colHeight;
      self.coloredMass = self.mass;
      self.coloredParticleSize = self.particleSize;
      self.coloredVei = self.vei;
      self.coloredWindDirection = self.windDirection;
      self.coloredWindSpeed = self.windSpeed;
    },
    numberGrid(resultType: SimOutput) {
      console.warn("WARNING: Numbering Grid is no longer supported ");
      self.hasErupted = true;
    },
    addPlotPoint(xAxis: string, yAxis: string, x: number, y: number) {
      self.plotData.setXAxis(xAxis);
      self.plotData.setYAxis(yAxis);
      self.plotData.points.push([x, y]);
    },
  }))
  .actions((self) => ({
    erupt(animate = false) {
      // This currently exists within erupt, but will probably move
      // to another block (like the paint by...)once there is some other
      // feedback for eruption
      self.windSpeed = self.stagingWindSpeed;
      self.windDirection = self.stagingWindDirection;
      self.colHeight = self.stagingColHeight;
      self.mass = self.stagingMass;
      self.vei = self.stagingVei;
      self.particleSize = self.stagingParticleSize;

      // auto-repaint if necessary
      if (!self.requirePainting) {
        // self.paintGrid("thickness", "#ff0000");
        self.paintMap();
      }

      // will be used when we add animations
      if (animate) {
        console.warn("WARNING: Animated eruptions are not currently supported");
        animate = false;
      }

      if (animate) {
        self.isErupting = true;
        self.pause();

        // if user hit run button, this stop lasts 3000 ms
        if (self.running) {
          setTimeout(self.unpause, 3000);
        }
      }
    },
    calculateAndAddPlotPoint(xData: SimulationVariable, yData: SimOutput, cityName: string) {
      console.warn("WARNING: Plot Point is not currently supported");
      // const xLabel = MeasurementLabel[xData];
      // const yLabel = MeasurementLabel[yData];

      // const city = self.cities.find(c => c.name === cityName);
      // if (!city) return;

      // const dataIndex = city.x + city.y * self.numCols;

      // const xVal = self[xData];
      // const yVal = self.data[dataIndex][yData];

      // self.addPlotPoint(xLabel, yLabel, xVal, yVal);
    }
  }))
  .actions((self) => {
    return {
      setWindSpeed(speed: number) {
        self.stagingWindSpeed = speed;
        // auto-erupt to recalculate data
        if (!self.requireEruption) {
          self.erupt();
        }
      },
      setVolcanoLat(lat: number) {
        self.volcanoLat = lat;
      },
      setVolcanoLng(lng: number) {
        self.volcanoLng = lng;
      },
      setColumnHeight(heightInKilometers: number) {
        self.stagingColHeight = heightInKilometers * 1000;      // km to m
        if (!self.requireEruption) {
          self.erupt();
        }
      },
      setMass(mass: number) {
        self.stagingMass = mass;
        // set equivalent VEI for reporting
        self.vei = Math.max(7, Math.min(15, Math.round(Math.log(mass) / Math.LN10))) - 7;
        if (!self.requireEruption) {
          self.erupt();
        }
      },
      setVEI(vei: number) {
        const clippedVEI = Math.max(0, Math.min(vei, 8));
        self.stagingVei = clippedVEI;
        // for now this is just setting the mass
        // we want vei 1 = 1e8, vei 8 = 1e15
        const mass = Math.pow(10, clippedVEI + 7);
        self.stagingMass = mass;

        const colHeight = ((kVEIIndexInfo[vei] && kVEIIndexInfo[vei].columnHeight) || .1 * 1000);
        self.stagingColHeight = colHeight;

        if (!self.requireEruption) {
          self.erupt();
        }
      },
      setParticleSize(size: number) {
        self.stagingParticleSize = size;
        if (!self.requireEruption) {
          self.erupt();
        }
      },
      setWindDirection(direction: number) {
        self.stagingWindDirection = direction;
        if (!self.requireEruption) {
          self.erupt();
        }
      },
      setModelParams(params: IModelParams) {
        self.stagingWindSpeed = params.windSpeed;
        self.stagingColHeight = params.colHeight;
        self.stagingMass = params.mass;
        self.stagingParticleSize = params.particleSize;
        self.stagingWindDirection = params.windDirection;
      },
      setVolcano(lat: number, lng: number) {
        self.volcanoLat = lat;
        self.volcanoLng = lng;
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
      logInfo(data: any) {
          self.log += (data) + "\n";
      },
      stringConcat(lv: any, rv: any) {
        if (lv || rv) {
          const output = (lv ? lv + " " : "") + (rv ? rv : "");

          // Build a return value that the interpreter can understand
          const out = {
            data: output
          };
          return (out);
        }
      }
    };
  })
  .actions((self) => {
    return {
      loadAuthorSettingsData: (data: SimulationAuthorSettings) => {
        Object.keys(data).forEach((key: SimulationAuthorSettingsProps) => {
          // annoying `as any ... as any` is needed because we're mixing bool and non-bool props, which combine to never
          // see https://github.com/microsoft/TypeScript/issues/31663
          (self[key] as any) = data[key] as any;
        });
      },
    };
  })
  .views((self) => {
    return {
      get cityHash() {
        return self.cities.reduce( (pre, cur) => `${pre}-${cur.name}${cur.x}${cur.y}`, "");
      },
    };
  });
export const simulation = SimulationStore.create({});

export type SimulationModelType = typeof SimulationStore.Type;
export type CityType = typeof City.Type;
