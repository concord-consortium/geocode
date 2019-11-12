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
  showCrossSection: true,
  showData: true,
  // other ui
  showLog: false,
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
}))
.actions((self) => {
  return {
    loadAuthorSettingsData: (data: UIAuthorSettings) => {
      Object.keys(data).forEach((key: UIAuthorSettingsProps) => {
        self[key] = data[key];
      });
    },
  };
});

export type UIModelType = typeof UIStore.Type;

export const uiStore = UIStore.create({});
