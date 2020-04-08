import { types } from "mobx-state-tree";
import { UIAuthorSettings, UIAuthorSettingsProps } from "./stores";

const UIStore = types.model("UI", {
  showOptionsDialog: true,
  // left tabs
  showBlocks: true,
  showCode: true,
  showControls: true,
  // right tabs
  showConditions: true,
  showCrossSection: false,
  showMonteCarlo: true,
  showData: true,
  // other ui
  showSpeedControls: false,
  showBarHistogram: false,
  speed: 0,       // 0-3 (for now)
  showLog: false,
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
})
.actions((self) => ({
  setShowOptionsDialog(show: boolean) {
    self.showOptionsDialog = show;
  },
  setHideBlocklyToolbox(show: boolean) {
    self.hideBlocklyToolbox = show;
  },
}))
.actions((self) => {
  return {
    loadAuthorSettingsData: (data: UIAuthorSettings) => {
      Object.keys(data).forEach((key: UIAuthorSettingsProps) => {
        self[key] = data[key];
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
