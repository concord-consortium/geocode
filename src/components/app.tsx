import { inject, observer } from "mobx-react";
import * as React from "react";
import DatGui, { DatBoolean, DatButton, DatSelect } from "react-dat-gui";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import { BaseComponent, IBaseProps } from "./base";
import { MapComponent } from "./map-component";
import { MapSidebarComponent } from "./map-sidebar-component";
import { CrossSectionComponent } from "./cross-section-component";
import * as Maps from "./../assets/maps/maps.json";
import * as BlocklyAuthoring from "./../assets/blockly-authoring/index.json";

import BlocklyContianer from "./blockly-container";
import styled from "styled-components";
import { Tab, Tabs, TabList, TabPanel, FixWidthTabPanel } from "./tabs";
import { js_beautify } from "js-beautify";
import SyntaxHighlighter from "react-syntax-highlighter";
import Controls from "./controls";
import RunButtons from "./run-buttons";

interface IProps extends IBaseProps {}

export interface SimulationAuthoringOptions {
  [key: string]: any;
  requireEruption: boolean;
  requirePainting: boolean;
  map: string;
  toolbox: string;
  initialCode: string;
  showBlocks: boolean;
  showCode: boolean;
  showControls: boolean;
  showCrossSection: boolean;
  showChart: boolean;
  showSidebar: boolean;
}

interface IState {
  showOptionsDialog: boolean;
  expandOptionsDialog: boolean;
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

  public constructor(props: IProps) {
    super(props);

    const initialState: IState = {
      showOptionsDialog: true,
      expandOptionsDialog: false,
      simulationOptions: {
        requireEruption: true,
        requirePainting: true,
        map: "Mt Redoubt",
        toolbox: "Everything",
        initialCode: "Basic",
        showBlocks: true,
        showCode: true,
        showControls: true,
        showCrossSection: false,
        showChart: false,
        showSidebar: false,
      }
    };

    // load in url params, if any, to state
    let urlParams: any = {};
    try {
      const queryString = location.search.length > 1 ? decodeURIComponent(location.search.substring(1)) : "{}";
      urlParams = JSON.parse(queryString);
    } catch (e) {
      // leave params empty
    }

    // set simulationOptions while making no assumptions about urlParams object
    const simulationOptionsKeys = Object.keys(initialState.simulationOptions);
    simulationOptionsKeys.forEach(option => {
      if (urlParams.hasOwnProperty(option)) {
        initialState.simulationOptions[option] = urlParams[option];
      }
    });

    // for now, assume that if we've loaded from params that we don't want settings dialog
    if (Object.keys(urlParams).length > 0) {
      initialState.showOptionsDialog = false;
    }

    this.state = initialState;
  }

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
      vei,
      numCols,
      numRows,
      data,
      gridColors,
      plotData,
      cities,
      volcanoX,
      volcanoY,
      run,
      step,
      stop,
      reset,
      running,
      isErupting
    } = this.stores;

    const {
      showOptionsDialog,
      expandOptionsDialog,
      simulationOptions
    } = this.state;

    const {
      map,
      toolbox,
      initialCode,
      showBlocks,
      showCode,
      showControls,
      showCrossSection,
      showChart,
      showSidebar
    } = simulationOptions;

    const mapPath = (Maps as {[key: string]: string})[map];
    const toolboxPath = (BlocklyAuthoring.toolbox as {[key: string]: string})[toolbox];
    const codePath = (BlocklyAuthoring.code as {[key: string]: string})[initialCode];

    return (
      <App className="app" >
        <Tabs>
          <TabList>
            { showBlocks && <Tab>Blocks</Tab>}
            { showCode && <Tab>Code</Tab>}
            { showControls && <Tab>Controls</Tab>}
          </TabList>
          { showBlocks &&
            <FixWidthTabPanel width={820}>
              <BlocklyContianer
                width={800}
                height={600}
                toolboxPath={toolboxPath}
                initialCodeSetupPath={codePath}
                setBlocklyCode={ setBlocklyCode} />
                <RunButtons {...{run, stop, step, reset, running}} />
            </FixWidthTabPanel>
          }
          { showCode &&
            <FixWidthTabPanel width={820}>
              <Code>
                <SyntaxHighlighter>
                  {js_beautify(code)}
                </SyntaxHighlighter>
              </Code>
            </FixWidthTabPanel>
          }
          { showControls &&
            <FixWidthTabPanel width={820}>
              <Controls />
            </FixWidthTabPanel>
          }
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
            isErupting={isErupting}
          />
          { showSidebar &&
            <MapSidebarComponent
              width={ 500 }
              height={ 100 }
              windSpeed={ windSpeed }
              windDirection={ windDirection }
              colHeight={ colHeight }
              vei={ vei }
              mass={ mass }
              particleSize={ particleSize }
            />
          }
          { showCrossSection &&
            <CrossSectionComponent
              data={ data }
              height={ 100 }
              numCols={ numCols }
              numRows={ numRows }
              width={ 500 }
              volcanoX={ volcanoX }
            />
          }
          { showChart &&
            <LineChart width={500} height={200} data={plotData.chartData}>
              <Line type="linear" dataKey={plotData.yAxis} stroke="red" strokeWidth={2} />
              <CartesianGrid stroke="#ddd" strokeDasharray="5 5" />
              <XAxis
                type="number"
                domain={[0, "auto"]}
                allowDecimals={false}
                dataKey={plotData.xAxis}
                label={{ value: plotData.xAxis, offset: -5, position: "insideBottom" }}
              />
              <YAxis
                type="number"
                domain={[0, "auto"]}
                label={{ value: plotData.yAxis, angle: -90, offset: 12, position: "insideBottomLeft" }}
              />
            </LineChart>
          }
        </Simulation>
        { showOptionsDialog &&
          <DatGui data={simulationOptions} onUpdate={this.handleUpdate}>
            <DatButton label="Model options" onClick={this.toggleShowOptions} />
            { expandOptionsDialog &&
              [
                <DatBoolean path="requireEruption" label="Require eruption?" key="requireEruption" />,
                <DatBoolean path="requirePainting" label="Require painting?" key="requirePainting" />,
                <DatSelect path="map" label="Map background" options={Object.keys(Maps)} key="background" />,
                <DatSelect path="toolbox" label="Code toolbox"
                  options={Object.keys(BlocklyAuthoring.toolbox)} key="toolbox" />,
                <DatSelect path="initialCode" label="Initial code"
                  options={Object.keys(BlocklyAuthoring.code)} key="code" />,

                <DatBoolean path="showBlocks" label="Show blocks?" key="showBlocks" />,
                <DatBoolean path="showCode" label="Show code?" key="showCode" />,
                <DatBoolean path="showControls" label="Show controls?" key="showControls" />,

                <DatBoolean path="showCrossSection" label="Show cross section?" key="showCrossSection" />,
                <DatBoolean path="showChart" label="Show chart?" key="showChart" />,
                <DatBoolean path="showSidebar" label="Show sidebar?" key="showSidebar" />,

                // submit button. Should remain at bottom
                <DatButton label="Generate authored model" onClick={this.generateAndOpenAuthoredUrl} key="generate" />
              ]
            }
          </DatGui>
        }

      </App>
    );
  }

  private toggleShowOptions = () => this.setState({expandOptionsDialog: !this.state.expandOptionsDialog});

  private handleUpdate = (simulationOptions: SimulationAuthoringOptions) => this.setState({ simulationOptions });

  private generateAndOpenAuthoredUrl = () => {
    const encodedParams = encodeURIComponent(JSON.stringify(this.state.simulationOptions));
    window.open(`${location.origin}${location.pathname}?${encodedParams}`, "geocode-app");
  }

}
