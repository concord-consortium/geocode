import { inject, observer } from "mobx-react";
import * as React from "react";
import DatGui, { DatBoolean, DatButton, DatSelect } from "react-dat-gui";
import { BaseComponent, IBaseProps } from "./base";
import { MapComponent } from "./map-component";
import { CrossSectionComponent } from "./cross-section-component";
import * as Maps from "./../assets/maps/maps.json";

import BlocklyContianer from "./blockly-container";
import styled from "styled-components";
import { Tab, Tabs, TabList, TabPanel, FixWidthTabPanel } from "./tabs";
import { js_beautify } from "js-beautify";
import SyntaxHighlighter from "react-syntax-highlighter";
import Controls from "./controls";
import RunButtons from "./run-buttons";
import { SimulationAuthoringOptions } from "../stores/simulation-store";

interface IProps extends IBaseProps {}

interface IState {
  showOptionsDialog: boolean;
  simulationOptions: SimulationAuthoringOptions;
}

const App = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    flex-direction: row;
    margin-top: 50px;
`;

const Simulation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const Code = styled.div`
  width: 800px;
  max-height: 600px;
  overflow: auto;
  padding: 1em;
`;

@inject("stores")
@observer
export class AppComponent extends BaseComponent<IProps, IState> {
  public state: IState = {
    showOptionsDialog: false,
    simulationOptions: {
      requireEruption: true,
      requirePainting: true,
      map: "Mt Redoubt"
    }
  };

  public componentDidUpdate() {
    this.stores.setAuthoringOptions(this.state.simulationOptions);
  }

  public render() {
    const {
      mass,
      windDirection,
      windSpeed,
      code,
      setBlocklyCode,
      colHeight,
      particleSize,
      numCols,
      numRows,
      data,
      gridColors,
      cities,
      volcanoX,
      volcanoY,
      run,
      step,
      stop,
      reset,
      running
    } = this.stores;

    const {
      showOptionsDialog,
      simulationOptions
    } = this.state;

    const mapPath = this.getMapPath();

    return (
      <App className="app" >
        <Tabs>
          <TabList>
            <Tab>Blocks</Tab>
            <Tab>Code</Tab>
            <Tab>Controls</Tab>
          </TabList>
          <FixWidthTabPanel width={820}>
            <BlocklyContianer
              width={800}
              height={600}
              setBlocklyCode={ setBlocklyCode} />
              <RunButtons {...{run, stop, step, reset, running}} />
          </FixWidthTabPanel>
          <FixWidthTabPanel width={820}>
            <Code>
              <SyntaxHighlighter>
                {js_beautify(code)}
              </SyntaxHighlighter>
            </Code>
          </FixWidthTabPanel>
          <FixWidthTabPanel width={820}>
            <Controls />
          </FixWidthTabPanel>
        </Tabs>

        <Simulation >
          <MapComponent
            windDirection={ windDirection }
            windSpeed={ windSpeed }
            mass={ mass }
            colHeight={ colHeight }
            particleSize={ particleSize }
            numCols={ numCols }
            numRows={ numRows }
            width={ 500 }
            height={ 500 }
            gridColors={ gridColors }
            cities={ cities }
            volcanoX={ volcanoX }
            volcanoY={ volcanoY }
            map={ mapPath }
          />
          <CrossSectionComponent
            data={ data }
            height={ 100 }
            numCols={ numCols }
            numRows={ numRows }
            width={ 500 }
            volcanoX={ volcanoX }
          />

        </Simulation>

        <DatGui data={simulationOptions} onUpdate={this.handleUpdate}>
          <DatButton label="Model options" onClick={this.toggleShowOptions} />
          { showOptionsDialog &&
            [
              <DatBoolean path="requireEruption" label="Require eruption?" key="requireEruption" />,
              <DatBoolean path="requirePainting" label="Require painting?" key="requirePainting" />,
              <DatSelect path="map" label="Map background" options={Object.keys(Maps)} key="background" />
            ]
          }
        </DatGui>

      </App>
    );
  }

  private getMapPath = () => {
    const map = this.state.simulationOptions.map;
    if ((Maps as {[key: string]: string})[map]) {   // ts being annoying
      return (Maps as {[key: string]: string})[map];
    }
    return "";
  }

  private toggleShowOptions = () => this.setState({showOptionsDialog: !this.state.showOptionsDialog});

  private handleUpdate = (simulationOptions: any) => this.setState({ simulationOptions });

}
