import * as React from "react";
import { BaseComponent, IBaseProps } from "./base";
import { inject, observer } from "mobx-react";
import RangeControl from "./range-control";
import styled from "styled-components";
import RunIcon from "../assets/blockly-icons/run.svg";
import ResetIcon from "../assets/blockly-icons/reset.svg";
import IconButton from "./buttons/icon-button";
import { HorizontalContainer, VerticalContainer, Footer, TabContent } from "./styled-containers";
import VEIWidget from "./widgets/vei-widget";
import EjectedVolumeWidget from "./widgets/ejected-volume-widget";
import ColumnHeightWidget from "./widgets/column-height-widget";
import WindSpeedDirectionWidget from "./widgets/wind-speed-direction-widget";
import { WidgetPanelTypes } from "../utilities/widget";

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  overflow: auto;
  min-height: 0px;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: 20px 28px 7px 28px;
  background-color: white;
`;

interface ControlContainerProps {
  height?: number;
}
const ControlContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px 8px 10px;
  height: ${(p: ControlContainerProps) => `${p.height ? `${p.height}px` : "100px"}`};
  margin-bottom: 20px;
  border-radius: 10px;
  background-color: #F0F0F0;
  font-size: 16px;
`;

const ControlLabel = styled.label`
  margin-top: 6px;
`;

const EruptButtons = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
`;

const NoteLabel = styled.label`
  font-size: 13px;
  font-style: italic;
`;

const BoldSpan = styled.span`
  font-weight: bold;
`;

interface IProps extends IBaseProps {
  width: number;
}
interface IState {
}

@inject("stores")
@observer
export class Controls extends BaseComponent<IProps, IState> {

  public render() {

    const {
      stagingWindDirection,
      stagingMass,
      stagingColHeight,
      stagingWindSpeed,
      stagingVei,
      reset
    } = this.stores.tephraSimulation;

    const {
      showWindSpeed,
      showWindDirection,
      showEjectedVolume,
      showColumnHeight,
      showVEI
    } = this.stores.uiStore;

    return(
      <TabContent>
        <ControlsContainer>
          {(showWindSpeed || showWindDirection) && <ControlContainer
                                                      height={showWindSpeed && showWindDirection ? 172 : 100}>
            <HorizontalContainer alignItems="center" data-test="wind-direction-speed-slider-container">
              <VerticalContainer alignItems="center" justifyContent="center">
                {showWindSpeed && <ControlLabel>Wind Speed (m/s)</ControlLabel>}
                {showWindSpeed && <HorizontalContainer data-test="wind-speed-slider">
                  <RangeControl
                    min={0}
                    max={30}
                    value={stagingWindSpeed}
                    step={1}
                    tickStep={5}
                    width={this.props.width - 220}
                    onChange={this.changeWindSpeed}
                  />
                </HorizontalContainer> }
                {showWindDirection && <ControlLabel>Wind Direction (° from North)</ControlLabel>}
                {showWindDirection && <HorizontalContainer data-test="wind-direction-slider">
                  <RangeControl
                    min={0}
                    max={360}
                    value={stagingWindDirection}
                    step={10}
                    tickMap={{
                      0: "0",
                      90: "90",
                      180: "180",
                      270: "270",
                      360: "0",
                    }}
                    width={this.props.width - 220}
                    onChange={this.changeWindDirection}
                  />
                </HorizontalContainer>}
              </VerticalContainer>
              <WindSpeedDirectionWidget
                type={WidgetPanelTypes.LEFT}
                showWindDirection={showWindDirection}
                showWindSpeed={showWindSpeed}
                windDirection={stagingWindDirection}
                windSpeed={stagingWindSpeed}
              />
            </HorizontalContainer>
          </ControlContainer>}
          {showEjectedVolume && <ControlContainer>
            <HorizontalContainer data-test="ejected-volume-slider-container">
              <VerticalContainer alignItems="center" justifyContent="center">
                <ControlLabel>Ejected Volume (km<sup>3</sup>)</ControlLabel>
                <HorizontalContainer data-test="ejected-volume-slider">
                  <RangeControl
                    min={0}
                    max={7}
                    value={Math.round(Math.log(stagingMass) / Math.LN10) - 8}
                    step={1}
                    tickMap={{
                      0: "10<sup>-4</sup>",
                      1: "10<sup>-3</sup>",
                      2: "10<sup>-2</sup>",
                      3: "10<sup>-1</sup>",
                      4: "10<sup>0</sup>",
                      5: "10<sup>1</sup>",
                      6: "10<sup>2</sup>",
                      7: "10<sup>3</sup>",
                    }}
                    width={this.props.width - 220}
                    onChange={this.changeMass}
                  />
                </HorizontalContainer>
              </VerticalContainer>
              <EjectedVolumeWidget
                type={WidgetPanelTypes.LEFT}
                volumeInKilometersCubed={stagingMass / Math.pow(10, 12)}
              />
            </HorizontalContainer>
          </ControlContainer>}
          {showColumnHeight && <ControlContainer>
            <HorizontalContainer data-test="column-height-slider-container">
              <VerticalContainer alignItems="center" justifyContent="center">
                <ControlLabel>Column Height (km)</ControlLabel>
                <HorizontalContainer data-test="column-height-slider">
                  <RangeControl
                    min={.5}
                    max={25}
                    value={stagingColHeight / 1000}
                    step={.1}
                    tickArray={[.5, 5, 10, 15, 20, 25]}
                    width={this.props.width - 220}
                    onChange={this.changeColumnHeight}
                  />
                </HorizontalContainer>
              </VerticalContainer>
              <ColumnHeightWidget
                type={WidgetPanelTypes.LEFT}
                columnHeightInKilometers={stagingColHeight / 1000}
              />
            </HorizontalContainer>
          </ControlContainer>}
          {showVEI && <ControlContainer>
            <HorizontalContainer data-test="vei-slider-container">
              <VerticalContainer alignItems="center" justifyContent="center">
                <label>VEI</label>
                <HorizontalContainer data-test="vei-slider">
                  <RangeControl
                    min={1}
                    max={8}
                    value={stagingVei}
                    step={1}
                    tickArray={[1, 2, 3, 4, 5, 6, 7, 8]}
                    width={this.props.width - 274}
                    onChange={this.changeVEI}
                  />
                </HorizontalContainer>
              </VerticalContainer>
              <VEIWidget
                type={WidgetPanelTypes.LEFT}
                vei={stagingVei}
                mass={stagingMass}
                columnHeight={stagingColHeight}
              />
            </HorizontalContainer>
          </ControlContainer>}
          <NoteLabel>
            <span>Note: changes made here will </span>
            <BoldSpan>not be</BoldSpan>
            <span> reflected in your Blocks/Code.</span>
          </NoteLabel>
        </ControlsContainer>
        <Footer>
          <EruptButtons>
            <IconButton
              onClick={reset}
              disabled={false}
              children={<ResetIcon />}
              label={"Reset"}
              hoverColor={"#FFDBAC"}
              activeColor={"#FFECD6"}
              fill={"#FFAC00"}
              width={26}
              height={26}
              dataTest={"Reset-button"}
            />
            <IconButton
              onClick={this.erupt}
              disabled={false}
              children={<RunIcon />}
              label={"Erupt"}
              hoverColor={"#FFDBAC"}
              activeColor={"#FFECD6"}
              fill={"#FFAC00"}
              width={26}
              height={26}
              dataTest={"Erupt-button"}
            />
          </EruptButtons>
        </Footer>
      </TabContent>
    );
  }

  private changeWindDirection = (direction: number) => {
    this.stores.tephraSimulation.setWindDirection(direction);
  }

  private changeWindSpeed = (speed: number) => {
    this.stores.tephraSimulation.setWindSpeed(speed);
  }

  private changeColumnHeight = (heightInKilometers: number) => {
    this.stores.tephraSimulation.setColumnHeight(heightInKilometers);
  }

  private changeMass = (zeroBasedPower: number) => {
    // -4 index conversion, +9 km^3 to m^3, +3 m^3 to kg
    const massInKilograms = Math.pow(10, zeroBasedPower - 4 + 9 + 3);
    this.stores.tephraSimulation.setMass(massInKilograms);
  }

  private changeSize = (size: number) => {
    this.stores.tephraSimulation.setParticleSize(size);
  }

  private changeVEI = (vei: number) => {
    this.stores.tephraSimulation.setVEI(vei);
  }

  private erupt = () => {
    this.stores.tephraSimulation.erupt();
    this.stores.tephraSimulation.paintMap();

    // This code is used for waiting for the animation to complete and then painting
    // if (this.state.animate) {
    //   setTimeout(() => {
    //     this.stores.endEruption();
    //     this.stores.paintMap();
    //   }, 3000);
    // } else {
    //   this.stores.paintMap();
    // }
  }
}

export default Controls;
