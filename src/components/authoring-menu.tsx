import * as React from "react";
import DatGui, { DatBoolean, DatButton, DatSelect, DatFolder, DatNumber } from "react-dat-gui";

import * as Scenarios from "./../assets/maps/scenarios.json";
import * as BlocklyAuthoring from "./../assets/blockly-authoring/index.json";
import { IStoreish } from "../stores/stores.js";

import "../css/dat-gui.css";

interface IProps {
  options: IStoreish;
  expandOptionsDialog: boolean;
  toggleShowOptions: () => void;
  saveStateToLocalStorage: () => void;
  loadStateFromLocalStorage: () => void;
  handleUpdate: (state: IStoreish) => void;
}

const AuthoringMenu: React.SFC<IProps> = (props) => {
  return (
    <DatGui data={props.options} onUpdate={props.handleUpdate} data-test="Model-option-toggle">
      <DatButton label="Model options" onClick={props.toggleShowOptions}/>
      { props.expandOptionsDialog &&
        [
          <DatBoolean path="tephraSimulation.requireEruption" label="Require eruption?" key="requireEruption" />,
          <DatBoolean path="tephraSimulation.requirePainting" label="Require painting?" key="requirePainting" />,
          <DatSelect path="tephraSimulation.scenario" label="Map Scenario"
            options={Object.keys(Scenarios)} key="background" />,
          <DatSelect path="tephraSimulation.toolbox" label="Code toolbox"
            options={Object.keys(BlocklyAuthoring.toolbox)} key="toolbox" />,
          <DatSelect path="tephraSimulation.initialCodeTitle" label="Initial code"
            options={Object.keys(BlocklyAuthoring.code)} key="code" />,

          <DatFolder title="Left Tabs" key="leftTabsFolder" closed={false}>
            <DatBoolean path="uiStore.showBlocks" label="Show blocks?" key="showBlocks" />
            <DatBoolean path="uiStore.showCode" label="Show code?" key="showCode" />
            <DatBoolean path="uiStore.showControls" label="Show controls?" key="showControls" />
          </DatFolder>,

          <DatFolder title="Right Tabs" key="rightTabsFolder" closed={false}>
            <DatBoolean path="uiStore.showConditions" label="Show conditions?" key="showConditions" />
            <DatBoolean path="uiStore.showMonteCarlo" label="Show monte carlo?" key="showMonteCarlo" />
            <DatBoolean path="uiStore.showCrossSection" label="Show cross section?" key="showCrossSection" />
            <DatBoolean path="uiStore.showData" label="Show data?" key="showData" />
          </DatFolder>,

          <DatFolder title="Controls Options" key="controlsFolder" closed={true}>
            <DatBoolean path="uiStore.showWindSpeed" label="Show Wind Speed?" key="showWindSpeed"/>
            <DatBoolean path="uiStore.showWindDirection" label="Show Wind Direction?" key="showWindDirection" />
            <DatBoolean path="uiStore.showEjectedVolume" label="Show Ejected Volume?" key="showEruptionMass" />
            <DatBoolean path="uiStore.showColumnHeight" label="Show Column Height?" key="showColumnHeight" />
            <DatBoolean path="uiStore.showVEI" label="Show VEI?" key="showVEI" />
          </DatFolder>,

          <DatBoolean path="uiStore.showSpeedControls" label="Show Speed Controls?" key="showSpeedControls" />,

          <DatBoolean path="uiStore.showBarHistogram" label="Show Bar Histogram?" key="showBarHistogram" />,

          <DatBoolean path="uiStore.showLog" label="Show Log?" key="showLog" />,

          <DatBoolean path="uiStore.showDemoCharts" label="Show Demo Charts?" key="showDemoCharts" />,

          <DatButton label="Save current state to local storage"
            onClick={props.saveStateToLocalStorage}
            key="generate" />,
          <DatButton label="Load state from local storage"
            onClick={props.loadStateFromLocalStorage}
            key="generate" />,
        ]
      }
    </DatGui>
  );
};

export default AuthoringMenu;
