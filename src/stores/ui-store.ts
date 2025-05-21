import { types } from "mobx-state-tree";
import { UIAuthorSettings, UIAuthorSettingsProps } from "./stores";

const km3ToM3 = 1000000; // 1 km^3 = 1000000 m^3

export const LavaMapTypes = ["terrain", "terrainWithLabels", "street"] as const;
export const LavaMapTypeStrings = LavaMapTypes.map((type) => type.toString());
export type LavaMapType = typeof LavaMapTypes[number];

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
  showData: true, // left tabs for LavaCoder
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
  // whether to show the Place Vent button
  showPlaceVent: true,
  // whether to show the Map Type button
  showMapType: true,
  // whether to include terrain in the map type options
  showMapTypeTerrain: true,
  // whether to include labeled terrain in the map type options
  showMapTypeLabeledTerrain: true,
  // whether to include street in the map type options
  showMapTypeStreet: true,
  // current map type
  mapType: types.optional(types.enumeration(LavaMapTypes), "terrain"),
  // vertical exaggeration (1 = normal, 2 = 2x, 3 = 3x, etc)
  verticalExaggeration: 1,
  // number of hundreds of pulses for each eruption. The actual number of pulses will be 100x this one.
  hundredsOfPulsesPerEruption: 20,
  // minimum and maximum eruption volume in km^3
  minEruptionVolumeInKM: 1,
  maxEruptionVolumeInKM: 10000,
  // minimum and maximum lava front height in meters
  minLavaFrontHeight: 2,
  maxLavaFrontHeight: 50,
  // show the erupted volume widget
  showEruptedVolume: true,
  // show the lava front height (residual) widget
  showLavaFrontHeight: true,
  // show the vent location widget
  showVentLocation: true,
  // hide toolbar in reports mode
  hideBlocklyToolbox: false,
  leftTabIndex: 0,
  rightTabIndex: 0,
})
.views((self) => ({
  get pulsesPerEruption() {
    return self.hundredsOfPulsesPerEruption * 100;
  },
  get minEruptionVolume() {
    return self.minEruptionVolumeInKM * km3ToM3;
  },
  get maxEruptionVolume() {
    return self.maxEruptionVolumeInKM * km3ToM3;
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
  }
}))
.actions((self) => {
  return {
    loadAuthorSettingsData: (data: UIAuthorSettings) => {
      Object.keys(data).forEach((key: UIAuthorSettingsProps) => {
        (self[key] as any) = data[key] as any;
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
