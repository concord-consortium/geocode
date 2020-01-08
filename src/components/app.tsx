import { inject, observer } from "mobx-react";
import * as React from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import { BaseComponent, IBaseProps } from "./base";
import { MapComponent } from "./map-component";
import { LogComponent } from "./log-component";
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
import AuthoringMenu from "./authoring-menu";
import { getAuthorableSettings, updateStores, serializeState, getSavableState, deserializeState, SerializedState } from "../stores/stores";

interface IProps extends IBaseProps {}

interface IState {
  tabIndex: number;
  rightTabIndex: number;
  expandOptionsDialog: boolean;
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
      expandOptionsDialog: false,
      dimensions: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    this.state = initialState;
  }

  public render() {
    const {
      simulation: {
        code,
        setBlocklyCode,
        plotData,
        run,
        clearLog,
        step,
        stop,
        reset,
        running,
        initialXmlCode,
        initialCodeTitle,
        toolbox,
        scenario
      },
      uiStore: {
        showOptionsDialog,
        showBlocks,
        showLog,
        showCode,
        showControls,
        showConditions,
        showCrossSection,
        showData,
      }
    } = this.stores;

    const {
      tabIndex,
      rightTabIndex,
      expandOptionsDialog
    } = this.state;

    const toolboxPath = (BlocklyAuthoring.toolbox as {[key: string]: string})[toolbox];
    const codePath = (BlocklyAuthoring.code as {[key: string]: string})[initialCodeTitle];

    const {width, height} = this.state.dimensions;
    const blocklyMargin = 3;
    const tabWidth = Math.floor(width * .5);
    const mapWidth = Math.floor(width * .5);
    const blocklyWidth = tabWidth - (blocklyMargin * 2);
    const blocklyHeight = Math.floor(height - 90);
    const logWidth = Math.floor(tabWidth * 0.95);
    const logHeight = Math.floor(height * .2);
    const scenarioData = (Scenarios as {[key: string]: {[key: string]: number}})[scenario];

    const latKey = "volcanoLat";
    const lngKey = "volcanoLng";

    this.stores.simulation.setVolcano(scenarioData[latKey], scenarioData[lngKey]);

    kTabInfo.blocks.index = showBlocks ? 0 : -1;
    kTabInfo.code.index = showCode ? kTabInfo.blocks.index + 1 : -1;
    kTabInfo.controls.index = showControls ? (showCode ? kTabInfo.code.index + 1 : kTabInfo.blocks.index + 1) : -1;
    const enabledTabTypes = [];
    if (showBlocks)   { enabledTabTypes.push(SectionTypes.BLOCKS); }
    if (showCode)     { enabledTabTypes.push(SectionTypes.CODE); }
    if (showControls) { enabledTabTypes.push(SectionTypes.CONTROLS); }

    kRightTabInfo.conditions.index = showConditions ? 0 : -1;
    kRightTabInfo.crossSection.index = showCrossSection ? kRightTabInfo.conditions.index + 1 : -1;
    kRightTabInfo.data.index = showData
      ? (showCrossSection ? kRightTabInfo.crossSection.index + 1 : kRightTabInfo.conditions.index + 1)
      : -1;
    const enabledRightTabTypes = [];
    if (showConditions)   { enabledRightTabTypes.push(RightSectionTypes.CONDITIONS); }
    if (showCrossSection) { enabledRightTabTypes.push(RightSectionTypes.CROSS_SECTION); }
    if (showData)         { enabledRightTabTypes.push(RightSectionTypes.DATA); }

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
                  { showLog &&
                    <LogComponent
                      width={logWidth}
                      height={logHeight}
                      clear={clearLog}
                    />
                  }
                </TabContent>
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
                />
              </TabPanel>
            }
          </Tabs>

          <Tabs selectedIndex={rightTabIndex} onSelect={this.handleRightTabSelect}>
            { showConditions &&
              <TabPanel
                width={`${tabWidth}px`}
                tabcolor={this.getRightTabColor(RightSectionTypes.CONDITIONS)}
                rightpanel={"true"}
              >
                <Simulation width={mapWidth} backgroundColor={this.getRightTabColor(RightSectionTypes.CONDITIONS)}>
                  <MapComponent
                    width={ mapWidth }
                    height={ height - 190 }
                    panelType={RightSectionTypes.CONDITIONS}
                  />
                  <WidgetPanel />
                </Simulation>
              </TabPanel>
            }
            { showCrossSection &&
              <TabPanel
                width={`${tabWidth}px`}
                tabcolor={this.getRightTabColor(RightSectionTypes.CROSS_SECTION)}
                rightpanel={"true"}
              >
                <Simulation width={mapWidth} backgroundColor={this.getRightTabColor(RightSectionTypes.CROSS_SECTION)}>
                  <MapComponent
                    width={ mapWidth }
                    height={ height - 190 }
                    panelType={RightSectionTypes.CROSS_SECTION}
                  />
                  <CrossSectionComponent
                    width={ mapWidth }
                    height={ 100 }
                  />
                </Simulation>
              </TabPanel>
            }
            { showData &&
              <TabPanel
                width={`${tabWidth}px`}
                tabcolor={this.getRightTabColor(RightSectionTypes.DATA)}
                rightpanel={"true"}
              >
                <div>
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
                </div>
              </TabPanel>
            }
            <RightTabBack
              width={tabWidth}
              backgroundcolor={this.getRightTabColor(currentRightTabType)}
            />
            <BottomBar>
              <TabsContainer>
                <TabList>
                  { showConditions &&
                    <BottomTab
                      selected={rightTabIndex === kRightTabInfo.conditions.index}
                      leftofselected={rightTabIndex === (kRightTabInfo.conditions.index + 1) ? "true" : undefined}
                      rightofselected={rightTabIndex === (kRightTabInfo.conditions.index - 1) ? "true" : undefined}
                      backgroundcolor={this.getRightTabColor(RightSectionTypes.CONDITIONS)}
                      backgroundhovercolor={this.getRightTabHoverColor(RightSectionTypes.CONDITIONS)}
                    >
                      {this.getRightTabName(RightSectionTypes.CONDITIONS)}
                    </BottomTab>
                  }
                  { showCrossSection &&
                    <BottomTab
                      selected={rightTabIndex === kRightTabInfo.crossSection.index}
                      leftofselected={rightTabIndex === (kRightTabInfo.crossSection.index + 1) ? "true" : undefined}
                      rightofselected={rightTabIndex === (kRightTabInfo.crossSection.index - 1) ? "true" : undefined}
                      backgroundcolor={this.getRightTabColor(RightSectionTypes.CROSS_SECTION)}
                      backgroundhovercolor={this.getRightTabHoverColor(RightSectionTypes.CROSS_SECTION)}
                    >
                      {this.getRightTabName(RightSectionTypes.CROSS_SECTION)}
                    </BottomTab>
                  }
                  { showData &&
                    <BottomTab
                      selected={rightTabIndex === kRightTabInfo.data.index}
                      leftofselected={rightTabIndex === (kRightTabInfo.data.index + 1) ? "true" : undefined}
                      rightofselected={rightTabIndex === (kRightTabInfo.data.index - 1) ? "true" : undefined}
                      backgroundcolor={this.getRightTabColor(RightSectionTypes.DATA)}
                      backgroundhovercolor={this.getRightTabHoverColor(RightSectionTypes.DATA)}
                    >
                      {this.getRightTabName(RightSectionTypes.DATA)}
                    </BottomTab>
                  }
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
            <AuthoringMenu
              options={getAuthorableSettings()}
              expandOptionsDialog={expandOptionsDialog}
              toggleShowOptions={this.toggleShowOptions}
              saveStateToLocalStorage={this.saveStateToLocalStorage}
              loadStateFromLocalStorage={this.loadStateFromLocalStorage}
              handleUpdate={updateStores}
            />
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

  private handleTabSelect(tabIndex: number) {
    this.setState({tabIndex});
  }

  private handleRightTabSelect(rightTabIndex: number) {
    this.setState({rightTabIndex});
  }

  private saveStateToLocalStorage = () => {
    localStorage.setItem("geocode-state", JSON.stringify(serializeState(getSavableState())));
  }

  private loadStateFromLocalStorage = () => {
    const savedStateJSON = localStorage.getItem("geocode-state");
    if (savedStateJSON) {
      const savedState = JSON.parse(savedStateJSON) as SerializedState;
      updateStores(deserializeState(savedState));
    }
  }

}
