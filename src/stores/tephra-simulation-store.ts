import { types, getSnapshot } from "mobx-state-tree";
import { kVEIIndexInfo } from "../utilities/vei";
import { TephraSimulationAuthorSettings, TephraSimulationAuthorSettingsProps } from "./stores";
import gridTephraCalc from "../tephra2";

let _cityCounter = 0;
const genCityId = () => `city_${_cityCounter++}`;

export interface ITephraModelParams {
  mass: number;
  windSpeed: number;
  colHeight: number;
  particleSize: number;
  windDirection: number;
  volcanoLat: number;
  volcanoLng: number;
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

// const MeasurementLabel: {[key in (SimOutput | SimulationVariable)]: string} = {
//   thickness: "Thickness (mm)",
//   windSpeed: "Wind speed (m/s)",
//   windDirection: "Wind direction (degrees)",
//   mass: "Eruption mass (kg)",
//   colHeight: "Column height (km)",
//   vei: "VEI"
// };

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

export const TephraSimulationStore = types
  .model("tephraSimulation", {
    windSpeed: 6,
    windDirection: 0,    // from north
    mass: 10000000000000,
    colHeight: 20000,      // meters
    particleSize: 1,
    stagingWindSpeed: 6,
    stagingWindDirection: 0,
    stagingMass: 10000000000000,
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
    log: "",
    plotData: types.optional(PlotData, getSnapshot(plotData)),
    hasErupted: false,
    isSelectingRuler: false,
    isSelectingCrossSection: false,
    isSelectingSetPoint: false,
    isSelectingSetRegion: false,
    latLngRegionPoint1Lat: 0,
    latLngRegionPoint1Lng: 0,
    latLngRegionPoint2Lat: 0,
    latLngRegionPoint2Lng: 0,
    latLngPointLat: 0,
    latLngPointLng: 0,
    // authoring props
    requireEruption: true,
    requirePainting: true,
    scenario: "Cerro Negro",
  })
  .views((self) => {
    const getVei = (mass: number, colHeight: number) => {
      // calculate the vei given the mass and the column height.
      // If the mass and column height were set by setting vei, these values will agree. If the user manually
      // changes mass and column height, we must make our best guess. We take the averge and round towards the
      // value given by mass.
      const massVEI =  Math.max(7, Math.min(15, Math.round(Math.log(mass) / Math.LN10))) - 7;
      let columnVEI = 1;
      while (columnVEI < 9 && kVEIIndexInfo[columnVEI].columnHeight < colHeight) {
        columnVEI++;
      }
      if (massVEI === columnVEI) {
        return massVEI;
      }
      const round = massVEI < columnVEI ? Math.floor : Math.ceil;
      return round((massVEI + columnVEI) / 2);
    };
    return {
      get vei() {
        // calculate the vei given the mass and the column height.
        return getVei(self.mass, self.colHeight);
      },
      get stagingVei() {
        // calculate the vei given the staging mass and the column height, used for vei slider
        return getVei(self.stagingMass, self.stagingColHeight);
      }
    };
  })
  .actions((self) => ({
    rulerClick() {
      self.isSelectingRuler = !self.isSelectingRuler;
      self.isSelectingCrossSection = false;
      self.isSelectingSetRegion = false;
      self.isSelectingSetPoint = false;
    },
    setPointClick() {
      self.isSelectingSetPoint = !self.isSelectingSetPoint;
      self.isSelectingSetRegion = false;
      self.isSelectingRuler = false;
      self.isSelectingCrossSection = false;
      if (!self.isSelectingSetPoint) {
        // clear original point
        self.latLngPointLat = 0;
        self.latLngPointLng = 0;
      }
      // clear points from set region
      self.latLngRegionPoint1Lat = 0;
      self.latLngRegionPoint1Lng = 0;
      self.latLngRegionPoint2Lat = 0;
      self.latLngRegionPoint2Lng = 0;
    },
    setRegionClick() {
      self.isSelectingSetRegion = !self.isSelectingSetRegion;
      self.isSelectingSetPoint = false;
      self.isSelectingRuler = false;
      self.isSelectingCrossSection = false;
      if (!self.isSelectingSetRegion) {
        // clear original points
        self.latLngRegionPoint1Lat = 0;
        self.latLngRegionPoint1Lng = 0;
        self.latLngRegionPoint2Lat = 0;
        self.latLngRegionPoint2Lng = 0;
      }
      // clear point from set point
      self.latLngPointLat = 0;
      self.latLngPointLng = 0;
    },
    crossSectionClick() {
      self.isSelectingCrossSection = !self.isSelectingCrossSection;
      self.isSelectingRuler = false;
      self.isSelectingSetRegion = false;
      self.isSelectingSetPoint = false;
    },
    setIsSelectingRuler(val: boolean) {
      self.isSelectingRuler = val;
    },
    setIsSelectingCrossSection(val: boolean) {
      self.isSelectingCrossSection = val;
    }
  }))
  .actions((self) => ({
    setViewportParameters(zoom: number, viewportCenterLat: number, viewportCenterLng: number) {
      self.viewportZoom = zoom;
      self.viewportCenterLat = viewportCenterLat;
      self.viewportCenterLng = viewportCenterLng;
    },
    setLatLngPoint(lat: number, lng: number) {
      self.latLngPointLat = lat;
      self.latLngPointLng = lng;
    },
    setLatLngP1(lat: number, lng: number) {
      self.latLngRegionPoint1Lat = lat;
      self.latLngRegionPoint1Lng = lng;
    },
    setLatLngP2(lat: number, lng: number) {
      self.latLngRegionPoint2Lat = lat;
      self.latLngRegionPoint2Lng = lng;
    },
    reset() {
      self.hasErupted = false;
      self.log = "";
      self.plotData = PlotData.create({});
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
  }))
  .actions((self) => ({
    paintMap() {
      self.hasErupted = true;
      self.coloredColHeight = self.colHeight;
      self.coloredMass = self.mass;
      self.coloredParticleSize = self.particleSize;
      self.coloredVei = self.vei;
      self.coloredWindDirection = self.windDirection;
      self.coloredWindSpeed = self.windSpeed;
    },
    addPlotPoint(xAxis: string, yAxis: string, x: number, y: number) {
      self.plotData.setXAxis(xAxis);
      self.plotData.setYAxis(yAxis);
      self.plotData.points.push([x, y]);
    },
  }))
  .actions((self) => ({
    /**
     * The whole erupt-paintMap cycle is odd "erupt" simply means shift all the values
     * from "stagingX" to "X". "paintMap" simply means setting "hasErupted" to true. The
     *  map layer itself then listens to the "hasErupted" value, and calculates all the
     *  data and paints itself.
     *
     * This seems fairly confusing. Erupt should calculate all the data. The map layer
     *  should just read the data.
     */
    erupt() {
      self.windSpeed = self.stagingWindSpeed;
      self.windDirection = self.stagingWindDirection;
      self.colHeight = self.stagingColHeight;
      self.mass = self.stagingMass;
      self.particleSize = self.stagingParticleSize;

      // auto-repaint if necessary
      if (!self.requirePainting) {
        // self.paintGrid("thickness", "#ff0000");
        self.paintMap();
      }
    },

    /**
     * Performs the tephra calculation for a specific location away from the volcano
     * @param dx x-distance from volcano
     * @param dy y-distance from volcano
     */
    calculateTephraAtLocation(dx: number, dy: number) {
      self.windSpeed = self.stagingWindSpeed;
      self.windDirection = self.stagingWindDirection;
      self.colHeight = self.stagingColHeight;
      self.mass = self.stagingMass;

      const thicknessCm = gridTephraCalc(
        dx, dy, 0, 0,
        self.stagingWindSpeed,
        self.stagingWindDirection,
        self.stagingColHeight,
        self.stagingMass
      );

      return thicknessCm * 10;      // cm => mm
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
        if (!self.requireEruption) {
          self.erupt();
        }
      },
      setVEI(vei: number) {
        // setting vei just sets mass and column height
        const clippedVEI = Math.max(0, Math.min(vei, 8));
        // we want vei 1 = 1e8, vei 8 = 1e15
        const mass = Math.pow(10, clippedVEI + 7);
        self.stagingMass = mass;

        const colHeight = ((kVEIIndexInfo[vei]?.columnHeight) || .1 * 1000);
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
      setModelParams(params: ITephraModelParams) {
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
      loadAuthorSettingsData: (data: TephraSimulationAuthorSettings) => {
        Object.keys(data).forEach((key: TephraSimulationAuthorSettingsProps) => {
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
export const tephraSimulation = TephraSimulationStore.create({});

export type TephraSimulationModelType = typeof TephraSimulationStore.Type;
export type CityType = typeof City.Type;
