import { inject, observer } from "mobx-react";
import * as React from "react";
import DatGui, { DatBoolean, DatButton, DatSelect, DatFolder, DatNumber } from "react-dat-gui";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import { BaseComponent, IBaseProps } from "./base";
import { MapComponent } from "./map-component";
import { LogComponent } from "./log-component";
import { MapSidebarComponent } from "./map-sidebar-component";
import { CrossSectionComponent } from "./cross-section-component";
import * as Maps from "./../assets/maps/maps.json";
import * as Scenarios from "./../assets/maps/scenarios.json";
import * as BlocklyAuthoring from "./../assets/blockly-authoring/index.json";

import BlocklyContainer from "./blockly-container";
import styled from "styled-components";
import { StyledButton } from "./styled-button";
import { SectionTypes, RightSectionTypes, TabInfo, kTabInfo, kRightTabInfo,
         TabBack, Tab, Tabs, TabList, TabPanel, RightTabBack, BottomTab } from "./tabs";
import { js_beautify } from "js-beautify";
import SyntaxHighlighter from "react-syntax-highlighter";
import Controls from "./controls";
import RunButtons from "./run-buttons";
import { Footer, TabContent } from "./styled-containers";
import WidgetPanel from "./widget-panel";
import screenfull from "screenfull";
import ResizeObserver from "react-resize-observer";

interface IProps extends IBaseProps {}

export interface SimulationAuthoringOptions {
  [key: string]: any;
  requireEruption: boolean;
  requirePainting: boolean;
  scenario: string;
  toolbox: string;
  initialCodeTitle: string;
  showBlocks: boolean;
  showCode: boolean;
  showControls: boolean;
  showWindSpeed: boolean;
  initialWindSpeed: number;
  showWindDirection: boolean;
  initialWindDirection: number;
  showEjectedVolume: boolean;
  initialEruptionMass: number;
  showColumnHeight: boolean;
  initialColumnHeight: number;
  initialParticleSize: number;
  showVEI: boolean;
  initialVEI: number;
  showCrossSection: boolean;
  showChart: boolean;
  showSidebar: boolean;
}

interface IState {
  tabIndex: number;
  rightTabIndex: number;
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
    overflow-x: hidden;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`;

const BottomBar = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
`;

const TabsContainer = styled.div`
  flex: 1 1 auto;
`;

const Simulation = styled.div`
  display: flex;
  flex-direction: column;
  width: ${(p: ISim) => `${p.width}px`};
  height: 100%;
  justify-content: flex-start;
  align-items: flex-start;
  background-color: ${(p: ISim) => p.backgroundColor};
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`;

interface ISim {
  width: number;
  backgroundColor?: string;
}

const Code = styled.div`
  display: flex;
  flex: 1 1 auto;
  box-sizing: border-box;
  width: 100%;
  overflow: auto;
  justify-content: flex-start;
`;

const Syntax = styled(SyntaxHighlighter)`
  flex: 1 1 auto;
  border: 2px solid white;
  margin: 0px;
`;

const FullscreenButton = styled(StyledButton)`
  width: 25px;
  height: 25px;
  margin: 1px;
  padding: 0px;
  border: 0px solid hsl(0, 0%, 0%);
  background-repeat: no-repeat;
  background-size: 100%;
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

    this.handleTabSelect = this.handleTabSelect.bind(this);
    this.handleRightTabSelect = this.handleRightTabSelect.bind(this);

    const initialState: IState = {
      tabIndex: 0,
      rightTabIndex: 0,
      showOptionsDialog: true,
      expandOptionsDialog: false,
      simulationOptions: {
        requireEruption: true,
        requirePainting: true,
        scenario: "Cerro Negro",
        toolbox: "Everything",
        initialCodeTitle: "Basic",
        showBlocks: true,
        showLog: false,
        showCode: true,
        showControls: true,
        showWindSpeed: true,
        initialWindSpeed: 5,
        showWindDirection: true,
        initialWindDirection: 310,
        showEjectedVolume: true,
        initialEruptionMass: 10000000000000,
        showColumnHeight: true,
        initialColumnHeight: 20000,
        initialParticleSize: 1,
        showVEI: true,
        initialVEI: 1,
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
    this.stores.setAuthoringOptions(initialState.simulationOptions, true);
  }

  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    const { scenario, showBlocks, showCode, showControls } = this.state.simulationOptions;
    if (prevState.simulationOptions.showBlocks !== showBlocks ||
        prevState.simulationOptions.showCode !== showCode ||
        prevState.simulationOptions.showControls !== showControls) {
          this.setState({tabIndex: 0});
        }
    const scenarioData = (Scenarios as {[key: string]: {[key: string]: number}})[scenario];

    // Have to do this or lint yells about string literals as keys
    const latKey = "volcanoLat";
    const lngKey = "volcanoLng";

    this.stores.setVolcano(scenarioData[latKey], scenarioData[lngKey]);

    this.stores.setAuthoringOptions(this.state.simulationOptions, false);
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
      isSelectingCrossSection,
      initialXmlCode
    } = this.stores;

    const {
      tabIndex,
      rightTabIndex,
      showOptionsDialog,
      expandOptionsDialog,
      simulationOptions
    } = this.state;

    const {
      map,
      toolbox,
      initialCodeTitle,
      showBlocks,
      showLog,
      showCode,
      showControls,
      showWindSpeed,
      initialWindSpeed,
      showWindDirection,
      initialWindDirection,
      showEjectedVolume,
      initialEruptionMass,
      showColumnHeight,
      initialColumnHeight,
      initialParticleSize,
      showVEI,
      initialVEI,
      showCrossSection,
      showChart,
      showSidebar,
    } = simulationOptions;

    const mapPath = (Maps as {[key: string]: string})[map];
    const toolboxPath = (BlocklyAuthoring.toolbox as {[key: string]: string})[toolbox];
    const codePath = (BlocklyAuthoring.code as {[key: string]: string})[initialCodeTitle];

    const {width, height} = this.state.dimensions;
    const blocklyMargin = 3;
    const tabWidth = Math.floor(width * .5);
    const mapWidth = Math.floor(width * .5);
    const blocklyWidth = tabWidth - (blocklyMargin * 2);
    const blocklyHeight = Math.floor(height * .7);
    const logWidth = Math.floor(tabWidth * 0.95);
    const logHeight = Math.floor(height * .2);
    const { scenario } = this.state.simulationOptions;
    const scenarioData = (Scenarios as {[key: string]: {[key: string]: number}})[scenario];
    const initialZoomKey = "initialZoom";
    const minZoomKey = "minZoom";
    const maxZoomKey = "maxZoom";
    const topLeftLatKey = "topLeftLat";
    const topLeftLngKey = "topLeftLng";
    const bottomRightLatKey = "bottomRightLat";
    const bottomRightLngKey = "bottomRightLng";

    const initialZoom = scenarioData[initialZoomKey];
    const minZoom = scenarioData[minZoomKey];
    const maxZoom = scenarioData[maxZoomKey];
    const topLeftLat = scenarioData[topLeftLatKey];
    const topLeftLng = scenarioData[topLeftLngKey];
    const bottomRightLat = scenarioData[bottomRightLatKey];
    const bottomRightLng = scenarioData[bottomRightLngKey];

    kTabInfo.blocks.index = showBlocks ? 0 : -1;
    kTabInfo.code.index = showCode ? kTabInfo.blocks.index + 1 : -1;
    kTabInfo.controls.index = showControls ? (showCode ? kTabInfo.code.index + 1 : kTabInfo.blocks.index + 1) : -1;
    const enabledTabTypes = [];
    if (showBlocks)   { enabledTabTypes.push(SectionTypes.BLOCKS); }
    if (showCode)     { enabledTabTypes.push(SectionTypes.CODE); }
    if (showControls) { enabledTabTypes.push(SectionTypes.CONTROLS); }
    const enabledRightTabTypes = [RightSectionTypes.CONDITIONS,
                                  RightSectionTypes.CROSS_SECTION,
                                  RightSectionTypes.DATA];
    const currentTabType = enabledTabTypes[tabIndex || 0];
    const currentRightTabType = enabledRightTabTypes[rightTabIndex || 0];

    return (
      <App className="app" ref={this.rootComponent}>
        <ResizeObserver
          onResize={this.resize}
        />
        <Row>
          <Tabs selectedIndex={tabIndex} onSelect={this.handleTabSelect}>
            <TabBack
              width={tabWidth}
              backgroundcolor={this.getTabColor(currentTabType)}
            />
            <TabList>
              { showBlocks &&
                <Tab
                  selected={tabIndex === kTabInfo.blocks.index}
                  leftofselected={tabIndex === (kTabInfo.blocks.index + 1) ? "true" : undefined}
                  rightofselected={tabIndex === (kTabInfo.blocks.index - 1) ? "true" : undefined}
                  backgroundcolor={this.getTabColor(SectionTypes.BLOCKS)}
                  backgroundhovercolor={this.getTabHoverColor(SectionTypes.BLOCKS)}
                >
                  {this.getTabName(SectionTypes.BLOCKS)}
                </Tab>
              }
              { showCode &&
                <Tab
                  selected={tabIndex === kTabInfo.code.index}
                  leftofselected={tabIndex === (kTabInfo.code.index + 1) ? "true" : undefined}
                  rightofselected={tabIndex === (kTabInfo.code.index - 1) ? "true" : undefined}
                  backgroundcolor={this.getTabColor(SectionTypes.CODE)}
                  backgroundhovercolor={this.getTabHoverColor(SectionTypes.CODE)}
                >
                  {this.getTabName(SectionTypes.CODE)}
                </Tab>
              }
              { showControls &&
                <Tab
                  selected={tabIndex === kTabInfo.controls.index}
                  leftofselected={tabIndex === (kTabInfo.controls.index + 1) ? "true" : undefined}
                  rightofselected={tabIndex === (kTabInfo.controls.index - 1) ? "true" : undefined}
                  backgroundcolor={this.getTabColor(SectionTypes.CONTROLS)}
                  backgroundhovercolor={this.getTabHoverColor(SectionTypes.CONTROLS)}
                >
                  {this.getTabName(SectionTypes.CONTROLS)}
                </Tab>
              }
            </TabList>
            { showBlocks &&
              <TabPanel
                width={`${tabWidth}px`}
                forceRender={true}
                tabcolor={this.getTabColor(SectionTypes.BLOCKS)}
              >
                <TabContent>
                  <BlocklyContainer
                    width={blocklyWidth}
                    height={blocklyHeight}
                    toolboxPath={toolboxPath}
                    initialCode={initialXmlCode}
                    initialCodePath={codePath}
                    setBlocklyCode={setBlocklyCode} />
                  <RunButtons {...{run, stop, step, reset, running}} />
                </TabContent>
                { showLog &&
                  <LogComponent
                    width={logWidth}
                    height={logHeight}
                    log={log}
                    clear={clearLog}
                  />
                }
              </TabPanel>
            }
            { showCode &&
              <TabPanel
                width={`${tabWidth}px`}
                tabcolor={this.getTabColor(SectionTypes.CODE)}
              >
                <TabContent>
                  <Code>
                    <Syntax>
                      {js_beautify(code.replace(/endStep\(\)\;\n/g, "").replace(/startStep\(\'.*\'\)\;\n/g, ""))}
                    </Syntax>
                  </Code>
                  <Footer />
                </TabContent>
              </TabPanel>
            }
            { showControls &&
              <TabPanel
                width={`${tabWidth}px`}
                tabcolor={this.getTabColor(SectionTypes.CONTROLS)}
              >
                <Controls
                  width={tabWidth}
                  showWindSpeed={showWindSpeed}
                  showWindDirection={showWindDirection}
                  showEjectedVolume={showEjectedVolume}
                  showColumnHeight={showColumnHeight}
                  showVEI={showVEI}
                />
              </TabPanel>
            }
          </Tabs>

          <Tabs selectedIndex={rightTabIndex} onSelect={this.handleRightTabSelect}>
            <TabPanel
              width={`${tabWidth}px`}
              tabcolor={this.getRightTabColor(RightSectionTypes.CONDITIONS)}
              rightpanel={"true"}
            >
              <Simulation width={mapWidth} backgroundColor={this.getRightTabColor(RightSectionTypes.CONDITIONS)}>
                <MapComponent
                  windDirection={ coloredWindDirection }
                  windSpeed={ coloredWindSpeed }
                  mass={ coloredMass }
                  colHeight={ coloredColHeight }
                  particleSize={ coloredParticleSize }
                  width={ mapWidth }
                  height={ height - 190 }
                  cities={ cities }
                  volcanoLat={ volcanoLat }
                  volcanoLng={ volcanoLng }
                  initialZoom={initialZoom}
                  minZoom={ minZoom }
                  maxZoom={ maxZoom }
                  topLeftLat={topLeftLat}
                  topLeftLng={topLeftLng}
                  bottomRightLat={bottomRightLat}
                  bottomRightLng={bottomRightLng}
                  viewportZoom={ viewportZoom }
                  viewportCenterLat={ viewportCenterLat }
                  viewportCenterLng={ viewportCenterLng }
                  map={ mapPath }
                  isErupting={isErupting}
                  showCrossSection={false}
                  hasErupted={ hasErupted }
                />
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
                <WidgetPanel
                  showWindSpeed={showWindSpeed}
                  showWindDirection={showWindDirection}
                  showColumnHeight={showColumnHeight}
                  showEjectedVolume={showEjectedVolume}
                  showVEI={showVEI}
                  windSpeed={ windSpeed }
                  windDirection={ windDirection }
                  columnHeight={ colHeight }
                  vei={ vei }
                  mass={ mass }
                />
              </Simulation>
            </TabPanel>
            <TabPanel
              width={`${tabWidth}px`}
              tabcolor={this.getRightTabColor(RightSectionTypes.CROSS_SECTION)}
              rightpanel={"true"}
            >
              <Simulation width={mapWidth} backgroundColor={this.getRightTabColor(RightSectionTypes.CROSS_SECTION)}>
                <MapComponent
                  windDirection={ coloredWindDirection }
                  windSpeed={ coloredWindSpeed }
                  mass={ coloredMass }
                  colHeight={ coloredColHeight }
                  particleSize={ coloredParticleSize }
                  width={ mapWidth }
                  height={ height - 190 }
                  cities={ cities }
                  volcanoLat={ volcanoLat }
                  volcanoLng={ volcanoLng }
                  initialZoom={initialZoom}
                  minZoom={ minZoom }
                  maxZoom={ maxZoom }
                  topLeftLat={topLeftLat}
                  topLeftLng={topLeftLng}
                  bottomRightLat={bottomRightLat}
                  bottomRightLng={bottomRightLng}
                  viewportZoom={ viewportZoom }
                  viewportCenterLat={ viewportCenterLat }
                  viewportCenterLng={ viewportCenterLng }
                  map={ mapPath }
                  isErupting={isErupting}
                  showCrossSection={true}
                  hasErupted={ hasErupted }
                />
                <CrossSectionComponent
                  isSelectingCrossSection={isSelectingCrossSection}
                  showCrossSectionSelector={isSelectingCrossSection}
                  height={ 100 }
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
              </Simulation>
            </TabPanel>
            <TabPanel
              width={`${tabWidth}px`}
              tabcolor={this.getRightTabColor(RightSectionTypes.DATA)}
              rightpanel={"true"}
            >
              <div/>
            </TabPanel>
            <RightTabBack
              width={tabWidth}
              backgroundcolor={this.getRightTabColor(currentRightTabType)}
            />
            <BottomBar>
              <TabsContainer>
                <TabList>
                  <BottomTab
                    selected={rightTabIndex === kRightTabInfo.conditions.index}
                    leftofselected={rightTabIndex === (kRightTabInfo.conditions.index + 1) ? "true" : undefined}
                    rightofselected={rightTabIndex === (kRightTabInfo.conditions.index - 1) ? "true" : undefined}
                    backgroundcolor={this.getRightTabColor(RightSectionTypes.CONDITIONS)}
                    backgroundhovercolor={this.getRightTabHoverColor(RightSectionTypes.CONDITIONS)}
                  >
                    {this.getRightTabName(RightSectionTypes.CONDITIONS)}
                  </BottomTab>
                  <BottomTab
                    selected={rightTabIndex === kRightTabInfo.crossSection.index}
                    leftofselected={rightTabIndex === (kRightTabInfo.crossSection.index + 1) ? "true" : undefined}
                    rightofselected={rightTabIndex === (kRightTabInfo.crossSection.index - 1) ? "true" : undefined}
                    backgroundcolor={this.getRightTabColor(RightSectionTypes.CROSS_SECTION)}
                    backgroundhovercolor={this.getRightTabHoverColor(RightSectionTypes.CROSS_SECTION)}
                  >
                    {this.getRightTabName(RightSectionTypes.CROSS_SECTION)}
                  </BottomTab>
                  <BottomTab
                    selected={rightTabIndex === kRightTabInfo.data.index}
                    leftofselected={rightTabIndex === (kRightTabInfo.data.index + 1) ? "true" : undefined}
                    rightofselected={rightTabIndex === (kRightTabInfo.data.index - 1) ? "true" : undefined}
                    backgroundcolor={this.getRightTabColor(RightSectionTypes.DATA)}
                    backgroundhovercolor={this.getRightTabHoverColor(RightSectionTypes.DATA)}
                  >
                    {this.getRightTabName(RightSectionTypes.DATA)}
                  </BottomTab>
                </TabList>
              </TabsContainer>
              { (screenfull && screenfull.isFullscreen) &&
                <FullscreenButtonOpen onClick={this.toggleFullscreen} />
              }
              { (screenfull && !screenfull.isFullscreen) &&
                <FullscreenButtonClosed onClick={this.toggleFullscreen} />
              }
            </BottomBar>
          </Tabs>
          { showOptionsDialog &&
            <DatGui data={simulationOptions} onUpdate={this.handleUpdate}>
            <DatButton label="Model options" onClick={this.toggleShowOptions} />
            { expandOptionsDialog &&
              [
                <DatBoolean path="requireEruption" label="Require eruption?" key="requireEruption" />,
                <DatBoolean path="requirePainting" label="Require painting?" key="requirePainting" />,
                <DatSelect path="scenario" label="Map Scenario" options={Object.keys(Scenarios)} key="background" />,
                <DatSelect path="toolbox" label="Code toolbox"
                  options={Object.keys(BlocklyAuthoring.toolbox)} key="toolbox" />,
                <DatSelect path="initialCodeTitle" label="Initial code"
                  options={Object.keys(BlocklyAuthoring.code)} key="code" />,

                <DatButton label="Save current code to local storage"
                  onClick={this.saveCodeToLocalStorage}
                  key="generate" />,
                <DatButton label="Load code from local storage"
                  onClick={this.loadCodeFromLocalStorage}
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
                  <DatBoolean path="showEjectedVolume" label="Show Ejected Volume?" key="showEjectedVolume" />
                  <DatNumber
                    path="initialEruptionMass" label="Initial Ejection Volume" key="initialEruptionMass"
                    min={100000000} max={10000000000000000} step={1000}/>
                  <DatBoolean path="showColumnHeight" label="Show Column Height?" key="showColumnHeight" />
                  <DatNumber
                    path="initialColumnHeight" label="Initial Column Height" key="initialColumnHeight"
                    min={1000} max={30000} step={1000}/>
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
                  onClick={this.generateAndOpenAuthoredUrl}
                  key="generate" />
              ]
            }
            </DatGui>
          }
        </Row>
      </App>
    );
  }

  private getTabColor = (type: SectionTypes) => {
    return (type ? kTabInfo[type].backgroundColor : "white");
  }
  private getTabHoverColor = (type: SectionTypes) => {
    return (type ? kTabInfo[type].hoverBackgroundColor : "white");
  }
  private getTabName = (type: SectionTypes) => {
    return (type ? kTabInfo[type].name : "");
  }

  private getRightTabColor = (type: RightSectionTypes) => {
    return (type ? kRightTabInfo[type].backgroundColor : "white");
  }
  private getRightTabHoverColor = (type: RightSectionTypes) => {
    return (type ? kRightTabInfo[type].hoverBackgroundColor : "white");
  }
  private getRightTabName = (type: RightSectionTypes) => {
    return (type ? kRightTabInfo[type].name : "");
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

  private handleTabSelect(tabIndex: number) {
    this.setState({tabIndex});
  }

  private handleRightTabSelect(rightTabIndex: number) {
    this.setState({rightTabIndex});
  }

  private generateAndOpenAuthoredUrl = () => {
    const encodedParams = encodeURIComponent(JSON.stringify(this.state.simulationOptions));
    window.open(`${location.origin}${location.pathname}?${encodedParams}`, "geocode-app");
  }

  private saveCodeToLocalStorage = () => {
    localStorage.setItem("blockly-workspace", this.stores.xmlCode);
  }

  private loadCodeFromLocalStorage = () => {
    const code = localStorage.getItem("blockly-workspace");
    if (code) {
      // we need to unset and then set the state to force a re-render, if the user has already
      // loaded the code once.
      // because of the way Blockly injects to the DOM, we have to wait 100ms, instead of using
      // the setState callback, or we may end up with two Blockly editors
      this.stores.setInitialXmlCode("<xml></xml>");
      setTimeout(() => {this.stores.setInitialXmlCode(code); }, 100);
    }
  }

}
