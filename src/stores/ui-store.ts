import { Cartesian2 } from "@cesium/engine";
import { types } from "mobx-state-tree";
import { UIAuthorSettings, UIAuthorSettingsProps } from "./stores";

const km3ToM3 = 1000000; // 1 km^3 = 1000000 m^3

export const LavaMapTypes = ["develop", "terrain", "terrainWithLabels", "street"] as const;
export const LavaMapTypeStrings = LavaMapTypes.map((type) => type.toString());
export type LavaMapType = typeof LavaMapTypes[number];

// The free, low-resolution imagery is the default so we don't consume Cesium ion quota by default.
const kDefaultMapType: LavaMapType = "develop";

interface ILavaCoderRulerLine {
  points: [Cartesian2, Cartesian2];
  distance: number;
}

const renamedKeys: Record<string, UIAuthorSettingsProps> = {
  verticalExaggeration: "_verticalExaggeration" as UIAuthorSettingsProps
};

const UIStore = types.model("UI", {
  showOptionsDialog: true,
  // left tabs
  showBlocks: true,
  showCode: false,
  showControls: false,
  // right tabs
  showConditions: true,
  showCrossSection: false,
  showMonteCarlo: true,
  showData: true,
  showDeformation: true,
  // other ui
  showDeformationGraph: false,
  showSpeedControls: false,
  showBarHistogram: false,
  speed: 0,       // 0-3 (for now)
  showLog: false,
  showRiskDiamonds: false,
  // slider controls
  showWindSpeed: true,
  showWindDirection: true,
  showEjectedVolume: true,
  showColumnHeight: true,
  showVEI: true,
  // chart demo buttons
  showDemoCharts: false,
  currentHistogramTab: 0,
  /*
   * LavaCoder map options
   */
  // whether to show the Lat/Long button
  showLatLongButton: true,
  // whether to show the Ruler button
  showRulerButton: true,
  // whether to show the Map Type button
  showMapType: true,
  // whether to include the free, low-resolution imagery in the map type options
  showMapTypeDevelop: true,
  // whether to include terrain in the map type options
  showMapTypeTerrain: true,
  // whether to include labeled terrain in the map type options
  showMapTypeLabeledTerrain: true,
  // whether to include street in the map type options
  showMapTypeStreet: true,
  // current map type
  mapType: types.optional(types.enumeration(LavaMapTypes), kDefaultMapType),
  // vertical exaggeration (1 = normal, 2 = 2x, 3 = 3x, etc)
  _verticalExaggeration: 3,
  // number of hundreds of pulses for each eruption. The actual number of pulses will be 100x this one.
  hundredsOfPulsesPerEruption: 3,
  // minimum and maximum eruption volume in km^3
  minEruptionVolumeInKM: 1,
  maxEruptionVolumeInKM: 10000,
  // minimum and maximum lava thickness in meters
  minLavaThickness: 2,
  maxLavaThickness: 50,
  // show the erupted volume widget
  showEruptedVolume: true,
  // show the lava thickness (residual) widget
  showLavaThickness: true,
  // show the vent location widget
  showVentLocation: true,
  // hide toolbar in reports mode
  hideBlocklyToolbox: false,
  leftTabIndex: 0,
  rightTabIndex: 0,
  // position of point selected with Lat/Long button
  pointLatitude: types.maybe(types.number),   // latitude in degrees
  pointLongitude: types.maybe(types.number),  // longitude in degrees
  pointElevation: types.maybe(types.number)   // elevation in meters
})
.volatile(self => ({
  tempVerticalExaggeration: undefined as number | undefined,
  rulerLine: undefined as ILavaCoderRulerLine | undefined
}))
.views((self) => ({
  get verticalExaggeration() {
    return self.tempVerticalExaggeration ?? self._verticalExaggeration;
  },
  get pulsesPerEruption() {
    return self.hundredsOfPulsesPerEruption * 100;
  },
  get minEruptionVolume() {
    return self.minEruptionVolumeInKM * km3ToM3;
  },
  get maxEruptionVolume() {
    return self.maxEruptionVolumeInKM * km3ToM3;
  },
  get hasLatLongPoint() {
    return self.pointLatitude != null && self.pointLongitude != null;
  }
}))
.actions((self) => ({
  setShowOptionsDialog(show: boolean) {
    self.showOptionsDialog = show;
  },
  setHideBlocklyToolbox(show: boolean) {
    self.hideBlocklyToolbox = show;
  },
  setMapType(mapType: LavaMapType) {
    self.mapType = mapType;
  },
  setLeftTabIndex(index: number) {
    self.leftTabIndex = index;
  },
  setRightTabIndex(index: number) {
    self.rightTabIndex = index;
  },
  setTempVerticalExaggeration(value: number | undefined) {
    self.tempVerticalExaggeration = value;
  },
  setRulerLine(line: ILavaCoderRulerLine | undefined) {
    if (!line ||
        !line.points[0].equals(self.rulerLine?.points[0]) ||
        !line.points[1].equals(self.rulerLine?.points[1]) ||
        line.distance !== self.rulerLine?.distance) {
      self.rulerLine = line;
    }
  },
  setLatLongPoint(latitude: number, longitude: number, elevation = 0) {
    self.pointLatitude = latitude;
    self.pointLongitude = longitude;
    self.pointElevation = elevation;
  },
  clearLatLongPoint() {
    self.pointLatitude = undefined;
    self.pointLongitude = undefined;
    self.pointElevation = undefined;
  }
}))
.actions((self) => {
  return {
    displayTable() {
      self.setRightTabIndex(1);
    },
    loadAuthorSettingsData: (data: UIAuthorSettings) => {
      Object.keys(data).forEach((key: UIAuthorSettingsProps) => {
        if (renamedKeys[key]) {
          (self[renamedKeys[key]] as any) = data[key] as any;
        } else {
          (self[key] as any) = data[key] as any;
        }
      });

      // if author is showing fast speed, set model to fast initially
      if (self.showSpeedControls) {
        self.speed = 3;
      } else {
        self.speed = 0;
      }
    },

    setSpeed: (speed: number) => {
      self.speed = speed;
    },
    setCurrentHistogramTab: (tab: number) => {
      self.currentHistogramTab = tab;
    },
  };
});

export type UIModelType = typeof UIStore.Type;

export const uiStore = UIStore.create({});
