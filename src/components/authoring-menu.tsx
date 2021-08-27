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
        <DatSelect path="unit.name" label="Unit"
          options={["Tephra", "Seismic"]} key="unit" />
      }
      { (props.expandOptionsDialog && props.options.unit.name === "Tephra") &&
        [
          <DatBoolean path="tephraSimulation.requireEruption" label="Require eruption?" key="requireEruption" />,
          <DatBoolean path="tephraSimulation.requirePainting" label="Require painting?" key="requirePainting" />,
          <DatSelect path="tephraSimulation.scenario" label="Map Scenario"
            options={Object.keys(Scenarios)} key="background" />,
          <DatSelect path="blocklyStore.toolbox" label="Code toolbox"
            options={BlocklyAuthoring.tephraToolboxes} key="toolbox" />,
          <DatSelect path="blocklyStore.initialCodeTitle" label="Initial code"
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
          <DatBoolean path="uiStore.showDemoCharts" label="Show Demo Charts?" key="showDemoCharts" />,
          <DatBoolean path="uiStore.showRiskDiamonds" label="Show Risk Diamonds?" key="showRiskDiamonds" />,

        ]
      }

      { (props.expandOptionsDialog && props.options.unit.name === "Seismic") &&
        [
          <DatSelect path="blocklyStore.toolbox" label="Code toolbox"
            options={BlocklyAuthoring.seismicToolboxes} key="toolbox" />,
          <DatSelect path="blocklyStore.initialCodeTitle" label="Initial code"
            options={Object.keys(BlocklyAuthoring.code)} key="code" />,

          <DatFolder title="Left Tabs" key="leftTabsFolder" closed={false}>
            <DatBoolean path="uiStore.showBlocks" label="Show blocks?" key="showBlocks" />
            <DatBoolean path="uiStore.showCode" label="Show code?" key="showCode" />
            <DatBoolean path="uiStore.showControls" label="Show controls?" key="showControls" />
          </DatFolder>,

          <DatFolder title="Right Tabs" key="rightTabsFolder" closed={false}>
            <DatBoolean path="uiStore.showConditions" label="Show map?" key="showConditions" />
            <DatBoolean path="uiStore.showData" label="Show data?" key="showData" />
            <DatBoolean path="uiStore.showDeformation" label="Show deformation?" key="showDeformation" />
          </DatFolder>,

          <DatFolder title="Deformation Model" key="deformationFolder" closed={false}>
            <DatNumber path="seismicSimulation.deformationModelWidthKm" label="Model width (km)" key="deformationModelWidthKm"
              min={0.1} max={100} step={0.1}/>
            <DatNumber path="seismicSimulation.deformationModelApparentWidthKm" label="Apparent width (km)" key="deformationModelApparentWidthKm"
              min={0.01} max={100} step={0.01}/>
            <DatNumber path="seismicSimulation.deformationModelApparentYearScaling" label="Apparent year scale" key="deformationModelApparentYearScaling"
              min={0.0001} max={1} step={0.0001}/>
            <DatBoolean path="seismicSimulation.deformationModelShowYear" label="Show years?" key="deformationModelShowYear" />
            <DatNumber path="seismicSimulation.deformationModelFrictionLow" label="Max displ. Low friction" key="deformationModelFrictionLow"
              min={0.1} max={50} step={0.1}/>
            <DatNumber path="seismicSimulation.deformationModelFrictionMedium" label="Max displ. Med friction" key="deformationModelFrictionMedium"
              min={0.1} max={50} step={0.1}/>
            <DatNumber path="seismicSimulation.deformationModelFrictionHigh" label="Max displ. High friction" key="deformationModelFrictionHigh"
              min={0.1} max={50} step={0.1}/>
            <DatBoolean path="seismicSimulation.deformationModelRainbowLines" label="Rainbow lines?" key="deformationModelRainbowLines" />
          </DatFolder>,
          <DatSelect path="seismicSimulation.deformationModelEarthquakeControl" label="Earthquakes"
            options={["none", "auto", "user"]} key="deformationModelEarthquakeControl" />,

          <DatBoolean path="uiStore.showSpeedControls" label="Show Speed Controls?" key="showSpeedControls" />,
        ]
      }
      {
        props.expandOptionsDialog &&
        [

          <DatButton label="Save current state to local storage"
            onClick={props.saveStateToLocalStorage}
            key="generate" />,
          <DatButton label="Load state from local storage"
            onClick={props.loadStateFromLocalStorage}
            key="generate" />
        ]
      }
    </DatGui>
  );
};

export default AuthoringMenu;
