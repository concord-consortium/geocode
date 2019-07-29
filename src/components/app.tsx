import { inject, observer } from "mobx-react";
import * as React from "react";
import DatGui, { DatBoolean, DatButton, DatSelect } from "react-dat-gui";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import { BaseComponent, IBaseProps } from "./base";
import { MapComponent } from "./map-component";
import { LogComponent } from "./log-component";
import { MapSidebarComponent } from "./map-sidebar-component";
import { CrossSectionComponent } from "./cross-section-component";
import * as Maps from "./../assets/maps/maps.json";
import * as BlocklyAuthoring from "./../assets/blockly-authoring/index.json";

import BlocklyContianer from "./blockly-container";
import styled from "styled-components";
import { StyledButton } from "./styled-button";
import { Tab, Tabs, TabList, TabPanel, FixWidthTabPanel } from "./tabs";
import { js_beautify } from "js-beautify";
import SyntaxHighlighter from "react-syntax-highlighter";
import Controls from "./controls";
import RunButtons from "./run-buttons";

import screenfull from "screenfull";
import ResizeObserver from "react-resize-observer";

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
  dimensions: {
    width: number;
    height: number;
  };
}

const App = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: row;
    height: 100vh;
    background-color: #ffffff;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`;

const Simulation = styled.div`
  display: flex;
  flex-direction: column;
  width: ${(p: ISim) => `${p.width}px`};
  justify-content: flex-start;
  align-items: flex-start;
`;

interface ISim {
  width: number;
}

const Code = styled.div`
  max-height: 400px;
  overflow: auto;
  padding: 1em;
`;

const FullscreenButton = styled(StyledButton)`
  width: 2.5em;
  height: 2.5em;
  border: 0px solid hsl(0, 0%, 0%);
  background-repeat: no-repeat;
  background-size: 95%;
`;

const FullscreenButtonOpen = styled(FullscreenButton)`
  background-image: url("./assets/fullscreen-exit.svg");

  &:hover {
    background-image: url("./assets/fullscreen-exit-dark.svg");
  }
`;

const FullscreenButtonClosed = styled(FullscreenButton)`
  background-image: url("./assets/fullscreen.svg");

  &:hover {
    background-image: url("./assets/fullscreen-dark.svg");
  }
`;

@inject("stores")
@observer
export class AppComponent extends BaseComponent<IProps, IState> {
  private rootComponent = React.createRef<HTMLDivElement>();

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
        showLog: false,
        showCode: true,
        showControls: true,
        showCrossSection: false,
        showChart: false,
        showSidebar: false
      },
      dimensions: {
        width: window.innerWidth,
        height: window.innerHeight
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
      log,
      setBlocklyCode,
      colHeight,
      particleSize,
      vei,
      coloredColHeight,
      coloredMass,
      coloredParticleSize,
      coloredVei,
      coloredWindDirection,
      coloredWindSpeed,
      plotData,
      cities,
      volcanoLat,
      volcanoLng,
      crossPoint1Lat,
      crossPoint1Lng,
      crossPoint2Lat,
      crossPoint2Lng,
      viewportZoom,
      viewportCenterLat,
      viewportCenterLng,
      run,
      clearLog,
      step,
      stop,
      reset,
      running,
      isErupting,
      hasErupted,
      isSelectingCrossSection
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
      showLog,
      showCode,
      showControls,
      showCrossSection,
      showChart,
      showSidebar
    } = simulationOptions;

    const mapPath = (Maps as {[key: string]: string})[map];
    const toolboxPath = (BlocklyAuthoring.toolbox as {[key: string]: string})[toolbox];
    const codePath = (BlocklyAuthoring.code as {[key: string]: string})[initialCode];

    const {width, height} = this.state.dimensions;
    const margin = 10;
    const tabWidth = Math.floor(width * .6);
    const mapWidth = Math.floor(width * .4) - margin;
    const blocklyWidth = tabWidth - (margin * 2);
    const blocklyHeight = Math.floor(height * .7);
    const logWidth = Math.floor(tabWidth * 0.95);
    const logHeight = Math.floor(height * .2);

    return (
      <App className="app" ref={this.rootComponent}>
        <ResizeObserver
          onResize={this.resize}
        />
        <Row>
          <Tabs>
            <TabList>
              { showBlocks && <Tab>Blocks</Tab>}
              { showCode && <Tab>Code</Tab>}
              { showControls && <Tab>Controls</Tab>}
            </TabList>
            { showBlocks &&
              <FixWidthTabPanel width={`${tabWidth}px`} forceRender={true}>
                <BlocklyContianer
                  width={blocklyWidth}
                  height={blocklyHeight}
                  toolboxPath={toolboxPath}
                  initialCodeSetupPath={codePath}
                  setBlocklyCode={ setBlocklyCode} />
                <RunButtons {...{run, stop, step, reset, running}} />
                {showLog &&
                  <LogComponent
                    width={logWidth}
                    height={logHeight}
                    log={log}
                    clear={clearLog}
                />}
              </FixWidthTabPanel>
            }
            { showCode &&
              <FixWidthTabPanel width={`${tabWidth}px`}>
                <Code>
                  <SyntaxHighlighter>
                    {js_beautify(code.replace(/endStep\(\)\;\n/g, "").replace(/startStep\(\'.*\'\)\;\n/g, ""))}
                  </SyntaxHighlighter>
                </Code>
              </FixWidthTabPanel>
            }
            { showControls &&
              <FixWidthTabPanel width={`${tabWidth}px`}>
                <Controls />
              </FixWidthTabPanel>
            }
          </Tabs>

          <Simulation width={mapWidth}>
            { (screenfull && screenfull.isFullscreen) &&
              <FullscreenButtonOpen onClick={this.toggleFullscreen} />
            }
            { (screenfull && !screenfull.isFullscreen) &&
              <FullscreenButtonClosed onClick={this.toggleFullscreen} />
            }
            <MapComponent
              windDirection={ coloredWindDirection }
              windSpeed={ coloredWindSpeed }
              mass={ coloredMass }
              colHeight={ coloredColHeight }
              particleSize={ coloredParticleSize }
              width={ mapWidth }
              height={ mapWidth }
              cities={ cities }
              volcanoLat={ volcanoLat }
              volcanoLng={ volcanoLng }
              initialZoom={8}
              viewportZoom={ viewportZoom }
              viewportCenterLat={ viewportCenterLat }
              viewportCenterLng={ viewportCenterLng }
              map={ mapPath }
              isErupting={isErupting}
              showCrossSection={showCrossSection}
              hasErupted={ hasErupted }
            />
              { showCrossSection &&
          <CrossSectionComponent
            isSelectingCrossSection={isSelectingCrossSection}
            showCrossSectionSelector={isSelectingCrossSection}
            height={ 150 }
            width={ mapWidth }
            volcanoLat={ volcanoLat }
            volcanoLng={ volcanoLng }
            crossPoint1Lat={ crossPoint1Lat }
            crossPoint1Lng={ crossPoint1Lng }
            crossPoint2Lat={ crossPoint2Lat }
            crossPoint2Lng={ crossPoint2Lng }
            hasErupted={ hasErupted }
            windSpeed={windSpeed}
            windDirection={windDirection}
            colHeight={colHeight}
            mass={mass}
            particleSize={particleSize}
          />
        }
        { showChart &&
          <LineChart width={mapWidth} height={200} data={plotData.chartData}>
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

        { showSidebar &&
          <MapSidebarComponent
            width={ mapWidth }
            height={ 100 }
            windSpeed={ windSpeed }
            windDirection={ windDirection }
            colHeight={ colHeight }
            vei={ vei }
            mass={ mass }
            particleSize={ particleSize }
          />
        }
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
                <DatBoolean path="showCrossSection" label="Show cross section?" key="showCrossSection" />,
                <DatBoolean path="showChart" label="Show chart?"
                  key="showChart" />,

                <DatBoolean path="showBlocks" label="Show blocks?" key="showBlocks" />,
                <DatBoolean path="showCode" label="Show code?" key="showCode" />,
                <DatBoolean path="showControls" label="Show controls?" key="showControls" />,
                <DatBoolean path="showLog" label="Show Log?" key="showLog" />,

                <DatBoolean path="showChart" label="Show chart?" key="showChart" />,
                <DatBoolean path="showSidebar" label="Show sidebar?" key="showSidebar" />,
                // submit button. Should remain at bottom
                <DatButton
                  label="Generate authored model"
                  onClick={this.generateAndOpenAuthoredUrl}
                  key="generate" />
              ]
            }
          </DatGui>
        }
        </Simulation>
      </Row>
    </App>
    );
  }

  private resize = (rect: DOMRect) => {
    this.setState({dimensions: rect});
  }

  private toggleFullscreen = () => {
    if (this.rootComponent.current) {
      if (screenfull && screenfull.enabled) {
        const component = this.rootComponent.current;
        screenfull.toggle(component);
      }
    }
  }

  private toggleShowOptions = () => this.setState({expandOptionsDialog: !this.state.expandOptionsDialog});

  private handleUpdate = (simulationOptions: SimulationAuthoringOptions) => this.setState({ simulationOptions });

  private generateAndOpenAuthoredUrl = () => {
    const encodedParams = encodeURIComponent(JSON.stringify(this.state.simulationOptions));
    window.open(`${location.origin}${location.pathname}?${encodedParams}`, "geocode-app");
  }

}
