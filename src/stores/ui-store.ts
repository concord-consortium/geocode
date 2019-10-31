import { types } from "mobx-state-tree";

const UIStore = types.model("UI", {
  showOptionsDialog: true,
  // tabs
  showBlocks: true,
  showCode: true,
  showControls: true,
  // other ui
  showLog: false,
  showCrossSection: false,
  showChart: false,
  showSidebar: false,
  // slider controls
  showWindSpeed: true,
  showWindDirection: true,
  showEjectedVolume: true,
  showColumnHeight: true,
  showParticleSize: true,
  showVEI: true,
})
.actions((self) => ({
  setShowOptionsDialog(show: boolean) {
    self.showOptionsDialog = show;
  }
}));

export type UIModelType = typeof UIStore.Type;

export const uiStore = UIStore.create({});
