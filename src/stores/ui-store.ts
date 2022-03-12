import { types } from "mobx-state-tree";
import { UIAuthorSettings, UIAuthorSettingsProps } from "./stores";

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
  // hide toolbar in reports mode
  hideBlocklyToolbox: false,
  leftTabIndex: 0,
  rightTabIndex: 0,
})
.actions((self) => ({
  setShowOptionsDialog(show: boolean) {
    self.showOptionsDialog = show;
  },
  setHideBlocklyToolbox(show: boolean) {
    self.hideBlocklyToolbox = show;
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
        self.speed = 2;
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
