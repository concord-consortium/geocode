import { inject, observer } from "mobx-react";
import * as React from "react";
const deepmerge = require("deepmerge");
import { BaseComponent, IBaseProps } from "./base";
import { MapComponent, Scenario } from "./map/map-component";
import { LogComponent } from "./log-component";
import { CrossSectionComponent } from "./crosssection/cross-section-component";
import * as Scenarios from "./../assets/maps/scenarios.json";
import * as BlocklyAuthoring from "./../assets/blockly-authoring/index.json";
import BlocklyContainer from "./blockly-container";
import styled from "styled-components";
import { StyledButton } from "./buttons/styled-button";
import { SectionTypes, RightSectionTypes, kTabInfo, kRightTabInfo,
         TabBack, Tab, Tabs, TabList, TabPanel, RightTabBack, BottomTab } from "./tabs";
import { js_beautify } from "js-beautify";
import SyntaxHighlighter from "react-syntax-highlighter";
import Controls from "./controls";
import RunButtons from "./buttons/run-buttons";
import { Footer, TabContent } from "./styled-containers";
import WidgetPanel from "./widgets/widget-panel";
import screenfull from "screenfull";
import ResizeObserver from "react-resize-observer";
import AuthoringMenu from "./authoring-menu";
import { getAuthorableSettings, updateStores, serializeState, getSavableStateAuthor,
         deserializeState, UnmigratedSerializedState, IStoreish } from "../stores/stores";
import { ChartPanel } from "./charts/chart-panel";
import { BlocklyController } from "../blockly/blockly-controller";
import { HistogramPanel } from "./montecarlo/histogram-panel";
import { PlateMovementPanel } from "./deformation/plate-movement-panel";
import { uiStore } from "../stores/ui-store";
import { unitStore } from "../stores/unit-store";
import { blocklyStore } from "../stores/blockly-store";
import { GPSStationTable } from "./gps-station-table";
import { DeformationModel } from "./deformation/deformation-model";
import { UnitNameType } from "../stores/unit-store";
import { queryValue, queryValueBoolean } from "../utilities/url-query";
import IconButton from "./buttons/icon-button";

interface IProps extends IBaseProps {
  reload: () => void;
}

interface IState {
  expandOptionsDialog: boolean;
  dimensions: {
    width: number;
    height: number;
  };
  showingReloadModal: boolean;
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

const CenteredRow = styled(Row)`
  justify-content: center;
  height: 135px;
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

const ModalBackground = styled.div`
	z-index: 1000;
	display: block;
	position: fixed;
	top: 0;
	left: 0;
	height: 100vh;
	width:100vw;
	background: rgba(0,0,0,0.25);
`;

const ModalPopup = styled.div`
	position:fixed;
	background: white;
	width: 210px;
	height: auto;
	top: 50%;
	left: 50%;
	transform: translate(-50%,-50%);
	border-radius: 5px;
  padding: 2px;
	color: #434343;
`;

const ModalHeader = styled.div`
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
	border-radius: 4px 4px 0 0;
  >div {
    position: absolute;
    right: 10px;
    top: 6px;
    font-weight: bold;
    font-size: 20px;
    color: #95c9ff;
    cursor: pointer;
  }
`;

const ModalContent = styled.div`
  width: 100%;
  height: 100%;
  >div {
    padding: 10px;
  }
`;

const ModalButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: end;
  margin-left: -10px;
`;

@inject("stores")
@observer
export class AppComponent extends BaseComponent<IProps, IState> {
  private rootComponent = React.createRef<HTMLDivElement>();
  private blocklyController: BlocklyController;

  public constructor(props: IProps) {
    super(props);

    this.handleLeftTabSelect = this.handleLeftTabSelect.bind(this);
    this.handleRightTabSelect = this.handleRightTabSelect.bind(this);

    const initialState: IState = {
      expandOptionsDialog: false,
      dimensions: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      showingReloadModal: false
    };

    this.state = initialState;

    this.blocklyController = new BlocklyController(this.stores);
  }

  public componentDidMount() {
    const unit = queryValue("unit");
    let hideModelOptions = queryValueBoolean("hide-model-options");
    if (unit === "Tephra") {
      blocklyStore.setToolbox(BlocklyAuthoring.tephraToolboxes[0]);
      unitStore.setUnit(unit);
      hideModelOptions = true;
    } else if (unit === "Seismic") {
      blocklyStore.setToolbox(BlocklyAuthoring.seismicToolboxes[0]);
      unitStore.setUnit(unit);
      hideModelOptions = true;
    }
    uiStore.setShowOptionsDialog(!hideModelOptions);
  }

  public render() {
    const {
      unit: {
        name: unitName,
      },
      tephraSimulation: {
        clearLog,
        scenario
      },
      seismicSimulation: {
        selectedGPSStation,
        startDeformationModel,
        deformSpeedPlate1,
        deformDirPlate1,
        deformSpeedPlate2,
        deformDirPlate2
      },
      blocklyStore: {
        initialXmlCode,
        initialCodeTitle,
        toolbox,
        blocklyRefreshCount,
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
        showMonteCarlo: _showMonteCarlo,
        showDeformation,
        showDeformationGraph,
        showSpeedControls,
        speed,
        hideBlocklyToolbox,
        leftTabIndex,
        rightTabIndex
      }
    } = this.stores;
    const {
      setCode,
      run,
      step,
      stop,
      pause,
      unpause,
      reset,
      running,
      paused,
      code,
    } = this.blocklyController;

    const {
      expandOptionsDialog,
      showingReloadModal,
    } = this.state;

    const isTephra = unitName === "Tephra";

    const showMonteCarlo = _showMonteCarlo && isTephra;

    const toolboxPath = (BlocklyAuthoring.toolbox as {[key: string]: string})[toolbox];
    const codePath = (BlocklyAuthoring.code as {[key: string]: string})[initialCodeTitle];

    const {width, height} = this.state.dimensions;
    const blocklyMargin = 3;
    const tabWidth = Math.floor(width * .5);
    const mapWidth = Math.floor(width * .5);
    const blocklyWidth = tabWidth - (blocklyMargin * 2);
    const logWidth = Math.floor(tabWidth * 0.95);
    const logHeight = Math.floor(height * .2);
    const blocklyHeight = Math.floor(height - 90 - (showLog ? logHeight : 0));
    const scenarioData = (Scenarios as {[key: string]: Scenario})[scenario];

    if (isTephra) {
      this.stores.tephraSimulation.setVolcano(scenarioData.centerLat, scenarioData.centerLng);
    }

    kTabInfo.blocks.index = showBlocks ? 0 : -1;
    kTabInfo.code.index = showCode ? kTabInfo.blocks.index + 1 : -1;
    kTabInfo.controls.index = showControls ? (showCode ? kTabInfo.code.index + 1 : kTabInfo.blocks.index + 1) : -1;
    const enabledTabTypes = [];
    if (showBlocks)   { enabledTabTypes.push(SectionTypes.BLOCKS); }
    if (showCode)     { enabledTabTypes.push(SectionTypes.CODE); }
    if (showControls) { enabledTabTypes.push(SectionTypes.CONTROLS); }

    kRightTabInfo.conditions.index = showConditions ? 0 : -1;
    kRightTabInfo.crossSection.index = showCrossSection ? kRightTabInfo.conditions.index + 1 : -1;
    kRightTabInfo.monteCarlo.index = showMonteCarlo
      ? (showCrossSection ? kRightTabInfo.crossSection.index + 1 : kRightTabInfo.conditions.index + 1)
      : -1;
    kRightTabInfo.data.index = showData
    ? (showMonteCarlo
        ? kRightTabInfo.monteCarlo.index + 1 :
        (showCrossSection ? kRightTabInfo.crossSection.index + 1 : kRightTabInfo.conditions.index + 1))
      : -1;
    kRightTabInfo.deformation.index = showDeformation ? kRightTabInfo.data.index + 1 : -1;
    const enabledRightTabTypes = [];
    if (showConditions)   { enabledRightTabTypes.push(RightSectionTypes.CONDITIONS); }
    if (showCrossSection) { enabledRightTabTypes.push(RightSectionTypes.CROSS_SECTION); }
    if (showMonteCarlo)   { enabledRightTabTypes.push(RightSectionTypes.MONTE_CARLO); }
    if (showData)         { enabledRightTabTypes.push(RightSectionTypes.DATA); }
    if (showDeformation)  { enabledRightTabTypes.push(RightSectionTypes.DEFORMATION); }

    const currentTabType = enabledTabTypes[leftTabIndex || 0];
    const currentRightTabType = enabledRightTabTypes[rightTabIndex || 0];

    const setSpeed = (_speed: number) => uiStore.setSpeed(_speed);

    const reload = () => {
      this.setState({showingReloadModal: false});
      // we first reset the blockly controller, which resets all the temporary state of the other
      // controllers, before reloading the initial application state
      reset();
      this.props.reload();
    };

    const showReloadModal = () => this.setState({showingReloadModal: true});
    const hideReloadModal = () => this.setState({showingReloadModal: false});

    return (
      <App className="app" ref={this.rootComponent}>
        <ResizeObserver
          onResize={this.resize}
        />
        <Row>
          <Tabs selectedIndex={leftTabIndex} onSelect={this.handleLeftTabSelect}>
            <TabBack
              width={tabWidth}
              backgroundcolor={this.getTabColor(currentTabType)}
            />
            <TabList>
              { showBlocks &&
                <Tab
                  selected={leftTabIndex === kTabInfo.blocks.index}
                  leftofselected={leftTabIndex === (kTabInfo.blocks.index + 1) ? "true" : undefined}
                  rightofselected={leftTabIndex === (kTabInfo.blocks.index - 1) ? "true" : undefined}
                  backgroundcolor={this.getTabColor(SectionTypes.BLOCKS)}
                  backgroundhovercolor={this.getTabHoverColor(SectionTypes.BLOCKS)}
                  data-test={this.getTabName(SectionTypes.BLOCKS) + "-tab"}
                >
                  {this.getTabName(SectionTypes.BLOCKS)}
                </Tab>
              }
              { showCode &&
                <Tab
                  selected={leftTabIndex === kTabInfo.code.index}
                  leftofselected={leftTabIndex === (kTabInfo.code.index + 1) ? "true" : undefined}
                  rightofselected={leftTabIndex === (kTabInfo.code.index - 1) ? "true" : undefined}
                  backgroundcolor={this.getTabColor(SectionTypes.CODE)}
                  backgroundhovercolor={this.getTabHoverColor(SectionTypes.CODE)}
                  data-test={this.getTabName(SectionTypes.CODE) + "-tab"}
                >
                  {this.getTabName(SectionTypes.CODE)}
                </Tab>
              }
              { showControls &&
                <Tab
                  selected={leftTabIndex === kTabInfo.controls.index}
                  leftofselected={leftTabIndex === (kTabInfo.controls.index + 1) ? "true" : undefined}
                  rightofselected={leftTabIndex === (kTabInfo.controls.index - 1) ? "true" : undefined}
                  backgroundcolor={this.getTabColor(SectionTypes.CONTROLS)}
                  backgroundhovercolor={this.getTabHoverColor(SectionTypes.CONTROLS)}
                  data-test={this.getTabName(SectionTypes.CONTROLS) + "-tab"}
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
                data-test={this.getTabName(SectionTypes.BLOCKS) + "-panel"}
              >
                <TabContent>
                  <BlocklyContainer
                    width={blocklyWidth}
                    height={blocklyHeight}
                    toolboxPath={toolboxPath}
                    initialCode={initialXmlCode}
                    initialCodePath={codePath}
                    setBlocklyCode={setCode}
                    hideToolbox={hideBlocklyToolbox}
                    blocklyRefreshCount={blocklyRefreshCount}/>
                  <RunButtons
                    run={run}
                    stop={stop}
                    pause={pause}
                    unpause={unpause}
                    step={step}
                    reset={reset}
                    running={running}
                    paused={paused}
                    isAtInitialState={false}
                    showSpeedControls={showSpeedControls}
                    speed={speed}
                    setSpeed={setSpeed}
                    reload={showReloadModal}
                   />
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
                data-test={this.getTabName(SectionTypes.CODE) + "-panel"}
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
                data-test={this.getTabName(SectionTypes.CONTROLS) + "-panel"}
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
                data-test={this.getRightTabName(RightSectionTypes.CONDITIONS) + "-panel"}
            >
              <Simulation width={mapWidth} backgroundColor={this.getRightTabColor(RightSectionTypes.CONDITIONS)}>
                  <MapComponent
                    width={ mapWidth }
                    height={ height - 190 }
                    panelType={RightSectionTypes.CONDITIONS}
                  />
                  {
                    isTephra &&
                    <WidgetPanel />
                  }
                  {
                    !isTephra &&
                    <CenteredRow>
                      {
                        selectedGPSStation &&
                        <GPSStationTable />
                      }
                    </CenteredRow>
                  }
                </Simulation>

              </TabPanel>
            }
            { showCrossSection &&
              <TabPanel
                width={`${tabWidth}px`}
                tabcolor={this.getRightTabColor(RightSectionTypes.CROSS_SECTION)}
                rightpanel={"true"}
                data-test={this.getRightTabName(RightSectionTypes.CROSS_SECTION) + "-panel"}
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
            { (showMonteCarlo) &&
              <TabPanel
                width={`${tabWidth}px`}
                tabcolor={this.getRightTabColor(RightSectionTypes.MONTE_CARLO)}
                rightpanel={"true"}
                data-test={this.getRightTabName(RightSectionTypes.MONTE_CARLO) + "-panel"}
              >
                <Simulation width={mapWidth} backgroundColor={this.getRightTabColor(RightSectionTypes.MONTE_CARLO)}>
                  <MapComponent
                    width={mapWidth}
                    height={(height - 90) * .65}
                    panelType={RightSectionTypes.MONTE_CARLO}
                  />
                  <HistogramPanel
                    width={mapWidth}
                    height={(height - 90) * .35}
                  />
                </Simulation>
              </TabPanel>
            }
            { showData &&
              <TabPanel
                width={`${tabWidth}px`}
                tabcolor={this.getRightTabColor(RightSectionTypes.DATA, unitName)}
                rightpanel={"true"}
                data-test={this.getRightTabName(RightSectionTypes.DATA) + "-panel"}
              >
                <div>
                  <ChartPanel width={mapWidth} />
                </div>
              </TabPanel>
            }
            {
              showDeformation && !showDeformationGraph && !isTephra &&
              <TabPanel
                width={`${tabWidth}px`}
                tabcolor={this.getRightTabColor(RightSectionTypes.DEFORMATION)}
                rightpanel={"true"}
                data-test={this.getRightTabName(RightSectionTypes.DEFORMATION) + "-panel"}
              >
                <DeformationModel
                  width={mapWidth}
                  height={height - 160}
                />
                <PlateMovementPanel
                  leftSpeed={deformSpeedPlate1}
                  leftDirection={180 - deformDirPlate1}
                  rightSpeed={deformSpeedPlate2}
                  rightDirection={180 - deformDirPlate2}
                />
              </TabPanel>
            }
            {
              showDeformation && showDeformationGraph && !isTephra && 
              <TabPanel
              width={`${tabWidth}px`}
              tabcolor={this.getRightTabColor(RightSectionTypes.DEFORMATION)}
              rightpanel={"true"}
              data-test={this.getRightTabName(RightSectionTypes.DEFORMATION) + "-panel"}
            >
              <DeformationModel
                width={mapWidth}
                height={height - 160}
              />
              <div>The deformation graph will show here!</div>
            </TabPanel>
            }
            
            <RightTabBack
              width={tabWidth}
              backgroundcolor={this.getRightTabColor(currentRightTabType, unitName)}
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
                      data-test={this.getRightTabName(RightSectionTypes.CONDITIONS) + "-tab"}
                    >
                      {this.getRightTabName(RightSectionTypes.CONDITIONS, unitName)}
                    </BottomTab>
                  }
                  { showCrossSection &&
                    <BottomTab
                      selected={rightTabIndex === kRightTabInfo.crossSection.index}
                      leftofselected={rightTabIndex === (kRightTabInfo.crossSection.index + 1) ? "true" : undefined}
                      rightofselected={rightTabIndex === (kRightTabInfo.crossSection.index - 1) ? "true" : undefined}
                      backgroundcolor={this.getRightTabColor(RightSectionTypes.CROSS_SECTION)}
                      backgroundhovercolor={this.getRightTabHoverColor(RightSectionTypes.CROSS_SECTION)}
                      data-test={this.getRightTabName(RightSectionTypes.CROSS_SECTION) + "-tab"}
                    >
                      {this.getRightTabName(RightSectionTypes.CROSS_SECTION)}
                    </BottomTab>
                  }
                  { showMonteCarlo &&
                    <BottomTab
                      selected={rightTabIndex === kRightTabInfo.monteCarlo.index}
                      leftofselected={rightTabIndex === (kRightTabInfo.monteCarlo.index + 1) ? "true" : undefined}
                      rightofselected={rightTabIndex === (kRightTabInfo.monteCarlo.index - 1) ? "true" : undefined}
                      backgroundcolor={this.getRightTabColor(RightSectionTypes.MONTE_CARLO)}
                      backgroundhovercolor={this.getRightTabHoverColor(RightSectionTypes.MONTE_CARLO)}
                      data-test={this.getRightTabName(RightSectionTypes.MONTE_CARLO) + "-tab"}
                    >
                      {this.getRightTabName(RightSectionTypes.MONTE_CARLO)}
                    </BottomTab>
                  }
                  { showData &&
                    <BottomTab
                      selected={rightTabIndex === kRightTabInfo.data.index}
                      leftofselected={rightTabIndex === (kRightTabInfo.data.index + 1) ? "true" : undefined}
                      rightofselected={rightTabIndex === (kRightTabInfo.data.index - 1) ? "true" : undefined}
                      backgroundcolor={this.getRightTabColor(RightSectionTypes.DATA, unitName)}
                      backgroundhovercolor={this.getRightTabHoverColor(RightSectionTypes.DATA)}
                      data-test={this.getRightTabName(RightSectionTypes.DATA) + "-tab"}
                    >
                      {this.getRightTabName(RightSectionTypes.DATA)}
                    </BottomTab>
                  }
                  { showDeformation && !isTephra &&
                    <BottomTab
                      selected={rightTabIndex === kRightTabInfo.deformation.index}
                      leftofselected={rightTabIndex === (kRightTabInfo.deformation.index + 1) ? "true" : undefined}
                      rightofselected={rightTabIndex === (kRightTabInfo.deformation.index - 1) ? "true" : undefined}
                      backgroundcolor={this.getRightTabColor(RightSectionTypes.DEFORMATION)}
                      backgroundhovercolor={this.getRightTabHoverColor(RightSectionTypes.DEFORMATION)}
                      data-test={this.getRightTabName(RightSectionTypes.DEFORMATION) + "-tab"}
                    >
                      {this.getRightTabName(RightSectionTypes.DEFORMATION)}
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
              handleUpdate={this.updateAuthoring}
            />
          }
          {
            showingReloadModal &&
            <ModalBackground onClick={hideReloadModal}>
              <ModalPopup>
                <ModalHeader>
                  Reload Model
                  <div onClick={hideReloadModal}>x</div>
                </ModalHeader>
                <ModalContent>
                  <div>
                    Are you sure you want to reload the model?
                  </div>
                  <div>
                    Reloading the model will remove all your work and return the
                    model to its original settings.
                  </div>
                  <ModalButtons>
                    <IconButton
                      onClick={hideReloadModal}
                      label="Cancel"
                      hoverColor="#BBD9FF"
                      activeColor="#DDEDFF"
                      borderColor="#DDEDFF"
                    />
                    <IconButton
                      onClick={reload}
                      label="Reload"
                      hoverColor="#BBD9FF"
                      activeColor="#DDEDFF"
                      borderColor="#DDEDFF"
                    />
                  </ModalButtons>
                </ModalContent>
              </ModalPopup>
            </ModalBackground>
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

  private getRightTabColor = (type: RightSectionTypes, unit?: UnitNameType) => {
    if (!type) return "white";
    if (unit && kRightTabInfo[type].unitBackgroundColor && kRightTabInfo[type].unitBackgroundColor![unit]) {
      return kRightTabInfo[type].unitBackgroundColor![unit];
    }
    return kRightTabInfo[type].backgroundColor;
  }
  private getRightTabHoverColor = (type: RightSectionTypes, unit?: UnitNameType) => {
    if (!type) return "white";
    if (unit && kRightTabInfo[type].unitHoverBackgroundColor && kRightTabInfo[type].unitHoverBackgroundColor![unit]) {
      return kRightTabInfo[type].unitHoverBackgroundColor![unit];
    }
    return kRightTabInfo[type].hoverBackgroundColor;
  }
  private getRightTabName = (type: RightSectionTypes, unit?: UnitNameType) => {
    if (!type) return "";
    if (unit && kRightTabInfo[type].unitDisplayName && kRightTabInfo[type].unitDisplayName![unit]) {
      return kRightTabInfo[type].unitDisplayName![unit];
    }
    return kRightTabInfo[type].name;
  }

  private resize = (rect: DOMRect) => {
    this.setState({dimensions: rect});
  }

  private toggleFullscreen = () => {
    if (screenfull && screenfull.enabled) {
      // we expand the entire body, instead of just the app, because blockly appends
      // things like input dialogs to the end of the document body
      screenfull.toggle(document.body);
    }
  }

  private toggleShowOptions = () => this.setState({expandOptionsDialog: !this.state.expandOptionsDialog});

  private handleLeftTabSelect(tabIndex: number) {
    this.stores.uiStore.setLeftTabIndex(tabIndex);
  }

  private handleRightTabSelect(tabIndex: number) {
    this.stores.uiStore.setRightTabIndex(tabIndex);
  }

  private updateAuthoring = (authorMenuState: IStoreish) => {
    // first get the state from the entire app, including slider values etc
    const localState = serializeState(getSavableStateAuthor()).state;

    // delete the initialXml code that was serialized, or we will never update the blocks when
    // the author changes the initial code
    delete localState.blocklyStore.initialXmlCode;

    // make any tweaks to the authorMenuState
    // here we check that the selected toolbox fits the selected unit
    if (authorMenuState.unit.name === "Tephra"
        && !BlocklyAuthoring.tephraToolboxes.includes(authorMenuState.blocklyStore.toolbox)) {
      authorMenuState.blocklyStore.toolbox = BlocklyAuthoring.tephraToolboxes[0];
    } else if (authorMenuState.unit.name === "Seismic"
        && !BlocklyAuthoring.seismicToolboxes.includes(authorMenuState.blocklyStore.toolbox)) {
      authorMenuState.blocklyStore.toolbox = BlocklyAuthoring.seismicToolboxes[0];
    }

    // update the apparent year scale to a default value if the earthquake mode changes
    const { deformationModelEarthquakeControl } = this.stores.seismicSimulation;
    const authoringEarthquakeControl = authorMenuState.seismicSimulation.deformationModelEarthquakeControl;
    if (authorMenuState.unit.name === "Seismic" && deformationModelEarthquakeControl !== authoringEarthquakeControl) {
        authorMenuState.seismicSimulation.deformationModelApparentYearScaling =
          authoringEarthquakeControl === "user" ? .001 : 1;
    }

    // the authored state from the authoring menu overwrites local state
    const mergedState = deepmerge(localState, authorMenuState);
    updateStores(mergedState);
  }

  private saveStateToLocalStorage = () => {
    localStorage.setItem("geocode-state", JSON.stringify(serializeState(getSavableStateAuthor())));
  }

  private loadStateFromLocalStorage = () => {
    const savedStateJSON = localStorage.getItem("geocode-state");
    if (savedStateJSON) {
      const savedState = JSON.parse(savedStateJSON) as UnmigratedSerializedState;
      updateStores(deserializeState(savedState));
    }
  }
}
