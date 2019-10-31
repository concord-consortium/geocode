import * as React from "react";
import DatGui, { DatBoolean, DatButton, DatSelect, DatFolder, DatNumber } from "react-dat-gui";

import * as Scenarios from "./../assets/maps/scenarios.json";
import * as BlocklyAuthoring from "./../assets/blockly-authoring/index.json";

interface IProps {
  options: {};
  expandOptionsDialog: boolean;
  handleUpdate: (simulationOptions: any) => void;
  toggleShowOptions: () => void;
  saveCodeToLocalStorage: () => void;
  loadCodeFromLocalStorage: () => void;
  generateAndOpenAuthoredUrl: () => void;
}

const AuthoringMenu: React.SFC<IProps> = (props) => {
  return (
    <DatGui data={props.options} onUpdate={props.handleUpdate}>
      <DatButton label="Model options" onClick={props.toggleShowOptions} />
      { props.expandOptionsDialog &&
        [
          <DatBoolean path="requireEruption" label="Require eruption?" key="requireEruption" />,
          <DatBoolean path="requirePainting" label="Require painting?" key="requirePainting" />,
          <DatSelect path="scenario" label="Map Scenario" options={Object.keys(Scenarios)} key="background" />,
          <DatSelect path="toolbox" label="Code toolbox"
            options={Object.keys(BlocklyAuthoring.toolbox)} key="toolbox" />,
          <DatSelect path="initialCodeTitle" label="Initial code"
            options={Object.keys(BlocklyAuthoring.code)} key="code" />,

          <DatButton label="Save current code to local storage"
            onClick={props.saveCodeToLocalStorage}
            key="generate" />,
          <DatButton label="Load code from local storage"
            onClick={props.loadCodeFromLocalStorage}
            key="generate" />,

          <DatBoolean path="showCrossSection" label="Show cross section?" key="showCrossSection" />,
          <DatBoolean path="showChart" label="Show chart?"
            key="showChart" />,

          <DatBoolean path="showBlocks" label="Show blocks?" key="showBlocks" />,
          <DatBoolean path="showCode" label="Show code?" key="showCode" />,
          <DatBoolean path="showControls" label="Show controls?" key="showControls" />,
          <DatFolder title="Controls Options" key="controlsFolder" closed={true}>
            <DatBoolean path="showWindSpeed" label="Show Wind Speed?" key="showWindSpeed"/>
            <DatNumber
              path="initialWindSpeed" label="Initial Wind Speed" key="initialWindSpeed"
              min={0} max={30} step={1}/>
            <DatBoolean path="showWindDirection" label="Show Wind Direction?" key="showWindDirection" />
            <DatNumber
              path="initialWindDirection" label="Initial Wind Direction" key="initialWindDirection"
              min={0} max={360} step={1}/>
            <DatBoolean path="showEruptionMass" label="Show Eruption Mass?" key="showEruptionMass" />
            <DatNumber
              path="initialEruptionMass" label="Initial Eruption Mass" key="initialEruptionMass"
              min={100000000} max={10000000000000000} step={1000}/>
            <DatBoolean path="showColumnHeight" label="Show Column Height?" key="showColumnHeight" />
            <DatNumber
              path="initialColumnHeight" label="Initial Column Height" key="initialColumnHeight"
              min={1000} max={30000} step={1000}/>
            <DatBoolean path="showParticleSize" label="Show Particle Size?" key="showParticleSize" />
            <DatBoolean path="showVEI" label="Show VEI?" key="showVEI" />
            <DatNumber
              path="initialVEI" label="Initial VEI" key="initialVEI"
              min={1} max={8} step={1}/>
          </DatFolder>,

          <DatBoolean path="showLog" label="Show Log?" key="showLog" />,

          <DatBoolean path="showChart" label="Show chart?" key="showChart" />,
          <DatBoolean path="showSidebar" label="Show sidebar?" key="showSidebar" />,
          // submit button. Should remain at bottom
          <DatButton
            label="Generate authored model"
            onClick={props.generateAndOpenAuthoredUrl}
            key="generate" />
        ]
      }
    </DatGui>
  );
};

export default AuthoringMenu;
