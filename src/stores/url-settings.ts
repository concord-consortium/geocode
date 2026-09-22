import { BlocklyAuthoring } from "../assets/blockly-authoring";
import { queryValue, queryValueBoolean } from "../utilities/url-query";
import { blocklyStore } from "./blockly-store";
import { uiStore } from "./ui-store";
import { unitStore } from "./unit-store";

/**
 * Applies settings specified as url parameters.
 */
export function applyUrlSettings(applyHideModelOptions=false) {
  const unit = queryValue("unit");
  let hideModelOptions = queryValueBoolean("hide-model-options");
  if (unit === "Tephra") {
    blocklyStore.setToolbox(BlocklyAuthoring.tephraToolboxes[0]);
    unitStore.setUnit(unit);
    hideModelOptions = true;
  } else if (unit === "Seismic") {
    blocklyStore.setToolbox(BlocklyAuthoring.seismicToolboxes[0]);
    unitStore.setUnit(unit);
    hideModelOptions = true;
  } else if (unit === "LavaCoder") {
    blocklyStore.setToolbox(BlocklyAuthoring.molassesToolboxes[0]);
    unitStore.setUnit(unit);
  }

  if (applyHideModelOptions) {
    uiStore.setShowOptionsDialog(!hideModelOptions);
  }
}
