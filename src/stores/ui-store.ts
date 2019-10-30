import { types } from "mobx-state-tree";

const UIStore = types.model("UI", {
  showOptionsDialog: true
})
.actions((self) => ({
  setShowOptionsDialog(show: boolean) {
    self.showOptionsDialog = show;
  }
}));

export type UIModelType = typeof UIStore.Type;

export const uiStore = UIStore.create({});
