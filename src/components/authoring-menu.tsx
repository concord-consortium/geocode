import * as React from "react";
import DatGui, { DatBoolean, DatButton, DatSelect, DatFolder, DatNumber } from "react-dat-gui";

import * as Scenarios from "./../assets/maps/scenarios.json";
import * as BlocklyAuthoring from "./../assets/blockly-authoring/index.json";
import { IStoreish } from "../stores/stores.js";

interface IProps {
  options: IStoreish;
  expandOptionsDialog: boolean;
  toggleShowOptions: () => void;
  saveCodeToLocalStorage: () => void;
  loadCodeFromLocalStorage: () => void;
  handleUpdate: (state: IStoreish) => void;
}

const AuthoringMenu: React.SFC<IProps> = (props) => {
  return (
    <DatGui data={props.options} onUpdate={props.handleUpdate}>
      <DatButton label="Model options" onClick={props.toggleShowOptions} />
      { props.expandOptionsDialog &&
        [
          <DatBoolean path="simulation.requireEruption" label="Require eruption?" key="requireEruption" />,
          <DatBoolean path="simulation.requirePainting" label="Require painting?" key="requirePainting" />,
          <DatSelect path="simulation.scenario" label="Map Scenario"
            options={Object.keys(Scenarios)} key="background" />,
          <DatSelect path="simulation.toolbox" label="Code toolbox"
            options={Object.keys(BlocklyAuthoring.toolbox)} key="toolbox" />,
          <DatSelect path="simulation.initialCodeTitle" label="Initial code"
            options={Object.keys(BlocklyAuthoring.code)} key="code" />,

          <DatBoolean path="uiStore.showBlocks" label="Show blocks?" key="showBlocks" />,
          <DatBoolean path="uiStore.showCode" label="Show code?" key="showCode" />,
          <DatBoolean path="uiStore.showControls" label="Show controls?" key="showControls" />,
          <DatFolder title="Controls Options" key="controlsFolder" closed={true}>
            <DatBoolean path="uiStore.showWindSpeed" label="Show Wind Speed?" key="showWindSpeed"/>
            <DatBoolean path="uiStore.showWindDirection" label="Show Wind Direction?" key="showWindDirection" />
            <DatBoolean path="uiStore.showEjectedVolume" label="Show Ejected Volume?" key="showEruptionMass" />
            <DatBoolean path="uiStore.showColumnHeight" label="Show Column Height?" key="showColumnHeight" />
            <DatBoolean path="uiStore.showVEI" label="Show VEI?" key="showVEI" />
          </DatFolder>,

          <DatBoolean path="uiStore.showLog" label="Show Log?" key="showLog" />,

          <DatBoolean path="uiStore.showChart" label="Show chart?" key="showChart" />,
          <DatBoolean path="uiStore.showSidebar" label="Show sidebar?" key="showSidebar" />,
          <DatBoolean path="uiStore.showCrossSection" label="Show cross section?" key="showCrossSection" />,

          <DatButton label="Save current code to local storage"
            onClick={props.saveCodeToLocalStorage}
            key="generate" />,
          <DatButton label="Load code from local storage"
            onClick={props.loadCodeFromLocalStorage}
            key="generate" />,
        ]
      }
    </DatGui>
  );
};

export default AuthoringMenu;
