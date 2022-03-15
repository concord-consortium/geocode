import * as React from "react";
import DatGui, { DatBoolean, DatButton, DatSelect, DatFolder, DatNumber } from "react-dat-gui";

import * as Scenarios from "./../assets/maps/scenarios.json";
import * as BlocklyAuthoring from "./../assets/blockly-authoring/index.json";
import { IStoreish } from "../stores/stores.js";

import "../css/dat-gui.css";
import * as strings from "../strings/components/authoring-menu";

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
      <DatButton label={strings.MODEL_OPTIONS} onClick={props.toggleShowOptions}/>
      { props.expandOptionsDialog &&
        <DatSelect path="unit.name" label={strings.UNIT}
          options={[strings.TEPHRA, strings.SEISMIC]} key="unit" />
      }
      { (props.expandOptionsDialog && props.options.unit.name === strings.TEPHRA) &&
        [
          <DatBoolean path="tephraSimulation.requireEruption" label={strings.REQUIRE_ERUPTION} key="requireEruption" />,
          <DatBoolean path="tephraSimulation.requirePainting" label={strings.REQUIRE_PAINTING} key="requirePainting" />,
          <DatSelect path="tephraSimulation.scenario" label={strings.MAP_SCENARIO}
            options={Object.keys(Scenarios)} key="background" />,
          <DatSelect path="blocklyStore.toolbox" label={strings.CODE_TOOLBOX}
            options={BlocklyAuthoring.tephraToolboxes} key="toolbox" />,
          <DatSelect path="blocklyStore.initialCodeTitle" label={strings.INITIAL_CODE}
            options={Object.keys(BlocklyAuthoring.code)} key="code" />,

          <DatFolder title={strings.LEFT_TABS} key="leftTabsFolder" closed={false}>
            <DatBoolean path="uiStore.showBlocks" label={strings.SHOW_BLOCKS} key="showBlocks" />
            <DatBoolean path="uiStore.showCode" label={strings.SHOW_CODE} key="showCode" />
            <DatBoolean path="uiStore.showControls" label={strings.SHOW_CONTROLS} key="showControls" />
          </DatFolder>,

          <DatFolder title={strings.RIGHT_TABS} key="rightTabsFolder" closed={false}>
            <DatBoolean path="uiStore.showConditions" label={strings.SHOW_CONDITIONS} key="showConditions" />
            <DatBoolean path="uiStore.showMonteCarlo" label={strings.SHOW_MONTE_CARLO} key="showMonteCarlo" />
            <DatBoolean path="uiStore.showCrossSection" label={strings.SHOW_CROSS_SECTION} key="showCrossSection" />
            <DatBoolean path="uiStore.showData" label={strings.SHOW_DATA} key="showData" />
          </DatFolder>,

          <DatFolder title={strings.CONTROL_OPTIONS} key="controlsFolder" closed={true}>
            <DatBoolean path="uiStore.showWindSpeed" label={strings.SHOW_WIND_SPEED} key="showWindSpeed"/>
            <DatBoolean path="uiStore.showWindDirection" label={strings.SHOW_WIND_DIRECTION} key="showWindDirection" />
            <DatBoolean path="uiStore.showEjectedVolume" label={strings.SHOW_EJECTED_VOLUME} key="showEruptionMass" />
            <DatBoolean path="uiStore.showColumnHeight" label={strings.SHOW_COLUMN_HEIGHT} key="showColumnHeight" />
            <DatBoolean path="uiStore.showVEI" label={strings.SHOW_VEI} key="showVEI" />
          </DatFolder>,

          <DatBoolean path="uiStore.showSpeedControls" label={strings.SHOW_SPEED_CONTROLS} key="showSpeedControls" />,
          <DatBoolean path="uiStore.showBarHistogram" label={strings.SHOW_HISTOGRAM} key="showBarHistogram" />,
          <DatBoolean path="uiStore.showDemoCharts" label={strings.SHOW_DEMO_CHARTS} key="showDemoCharts" />,
          <DatBoolean path="uiStore.showRiskDiamonds" label={strings.SHOW_RISK_DIAMONDS} key="showRiskDiamonds" />,

        ]
      }

      { (props.expandOptionsDialog && props.options.unit.name === strings.SEISMIC) &&
        [
          <DatSelect path="blocklyStore.toolbox" label={strings.CODE_TOOLBOX}
            options={BlocklyAuthoring.seismicToolboxes} key="toolbox" />,
          <DatSelect path="blocklyStore.initialCodeTitle" label={strings.INITIAL_CODE}
            options={Object.keys(BlocklyAuthoring.code)} key="code" />,

          <DatFolder title={strings.LEFT_TABS} key="leftTabsFolder" closed={false}>
            <DatBoolean path="uiStore.showBlocks" label={strings.SHOW_BLOCKS} key="showBlocks" />
            <DatBoolean path="uiStore.showCode" label={strings.SHOW_CODE} key="showCode" />
            <DatBoolean path="uiStore.showControls" label={strings.SHOW_CONTROLS} key="showControls" />
          </DatFolder>,

          <DatFolder title={strings.RIGHT_TABS} key="rightTabsFolder" closed={false}>
            <DatBoolean path="uiStore.showConditions" label={strings.SHOW_CONDITIONS} key="showConditions" />
            <DatBoolean path="uiStore.showData" label={strings.SHOW_DATA} key="showData" />
            <DatBoolean path="uiStore.showDeformation" label={strings.SHOW_DEFORMATION_Q} key="showDeformation" />
          </DatFolder>,
          <DatFolder title={strings.DEFORMATION_MODEL} key="deformationFolder" closed={false}>
            <DatBoolean path="uiStore.showDeformationGraph" label="Show graph?" key="showDeformationGraph" />
            <DatNumber path="seismicSimulation.deformationModelWidthKm" label={strings.MODEL_WIDTH} key="deformationModelWidthKm"
              min={0.1} max={100} step={0.1}/>
            <DatNumber path="seismicSimulation.deformationModelApparentWidthKm" label={strings.APPARENT_WIDTH} key="deformationModelApparentWidthKm"
              min={0.01} max={100} step={0.01}/>
            <DatNumber path="seismicSimulation.deformationModelApparentYearScaling" label={strings.APPARENT_YEAR} key="deformationModelApparentYearScaling"
              min={0.0001} max={1} step={0.0001}/>
            <DatBoolean path="seismicSimulation.deformationModelShowYear" label={strings.SHOW_YEARS} key="deformationModelShowYear" />
            <DatNumber path="seismicSimulation.deformationModelFrictionLow" label={strings.LOW_FRICTION} key="deformationModelFrictionLow"
              min={0.1} max={50} step={0.1}/>
            <DatNumber path="seismicSimulation.deformationModelFrictionMedium" label={strings.MED_FRICTION} key="deformationModelFrictionMedium"
              min={0.1} max={50} step={0.1}/>
            <DatNumber path="seismicSimulation.deformationModelFrictionHigh" label={strings.HIGH_FRICTION} key="deformationModelFrictionHigh"
              min={0.1} max={50} step={0.1}/>
            <DatBoolean path="seismicSimulation.deformationModelRainbowLines" label={strings.RAINBOW_LINES} key="deformationModelRainbowLines" />
            <DatNumber path="seismicSimulation.deformationModelFaultAngle" label={strings.FAULT_ANGLE} key="deformationModelFaultAngle"
              min={-90} max={90} step={1}/>
          </DatFolder>,
          <DatSelect path="seismicSimulation.deformationModelEarthquakeControl" label={strings.EARTHQUAKES}
            options={["none", "auto", "user"]} key="deformationModelEarthquakeControl" />,

          <DatBoolean path="uiStore.showSpeedControls" label={strings.SHOW_SPEED_CONTROLS} key="showSpeedControls" />,
        ]
      }
      {
        props.expandOptionsDialog &&
        [

          <DatButton label={strings.SAVE_STATE}
            onClick={props.saveStateToLocalStorage}
            key="generate" />,
          <DatButton label={strings.LOAD_STATE}
            onClick={props.loadStateFromLocalStorage}
            key="generate" />
        ]
      }
    </DatGui>
  );
};

export default AuthoringMenu;
