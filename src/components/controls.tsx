import * as React from "react";
import { BaseComponent, IBaseProps } from "./base";
import { inject, observer } from "mobx-react";
import RangeControl from "./range-control";
import styled from "styled-components";
import ColumnHeightIcon from "../assets/controls-icons/column-height.svg";
import EjectedVolumeIcon from "../assets/controls-icons/ejected-volume.svg";
import ParticleIcon from "../assets/controls-icons/particle.svg";
import WindSpeedDirectionIcon from "../assets/controls-icons/wind-speed-direction.svg";
import RunIcon from "../assets/blockly-icons/run.svg";
import { Icon } from "./icon";
import IconButton from "./icon-button";

const StyledControls = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
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

const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 104px;
  height: 80px;
  margin-left: auto;
  padding: 2px;
  border-radius: 7px;
  background-color: #FFDBAC;
`;

const ValueOutput = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 21px;
  border-radius: 0 0 5px 5px;
  background-color: white;
  text-align: center;
  font-size: 12px;
`;

const ValueDivider = styled.div`
  width: 1px;
  height: 21px;
  margin: 0 5px 0 5px;
  background-color: #FFDBAC;
`;

const IconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60px;
`;

interface HorizontalContainerProps {
  alignItems?: string;
  justifyContent?: string;
}
const HorizontalContainer = styled.div`
  display: flex;
  align-items: ${(p: HorizontalContainerProps) => `${p.alignItems ? p.alignItems : "flex-start"}`};
  justify-content: ${(p: VerticalContainerProps) => `${p.alignItems ? p.alignItems : "flex-start"}`};
`;

interface VerticalContainerProps {
  alignItems?: string;
  justifyContent?: string;
}
const VerticalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(p: VerticalContainerProps) => `${p.alignItems ? p.alignItems : "flex-start"}`};
  justify-content: ${(p: VerticalContainerProps) => `${p.alignItems ? p.alignItems : "flex-start"}`};
`;

const EruptContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 44px;
`;

const EruptButtons = styled.div`
  position: relative;
`;

const NoteLabel = styled.label`
  font-size: 13px;
  font-style: italic;
`;

const BoldSpan = styled.span`
  font-weight: bold;
`;

interface IControls {
  windDirection: number;
  particleSize: number;
  mass: number;
  colHeight: number;
  windSpeed: number;

  changeWindDirection: (a: any) => void;
  changeWindSpeed: (a: any) => void;
  changeSize: (a: any) => void;
  changeColumnHeight: (a: any) => void;
  changeMass: (a: any) => void;
}

interface IProps extends IBaseProps {
  width: number;
  showWindSpeed: boolean;
  showWindDirection: boolean;
  showEjectedVolume: boolean;
  showColumnHeight: boolean;
}
interface IState {
  animate: boolean;
}

@inject("stores")
@observer
export class Controls extends BaseComponent<IProps, IState> {
  public state = {
    animate: true
  };

  public render() {

    const {
      stagingWindDirection,
      stagingParticleSize,
      stagingMass,
      stagingColHeight, // in meters
      stagingWindSpeed
    } = this.stores;

    const {
      showWindSpeed,
      showWindDirection,
      showEjectedVolume,
      showColumnHeight,
    } = this.props;

    return(
      <StyledControls>
        <ControlsContainer>
          {(showWindSpeed || showWindDirection) && <ControlContainer
                                                      height={showWindSpeed && showWindDirection ? 172 : 100}>
            <HorizontalContainer alignItems="center">
              <VerticalContainer alignItems="center" justifyContent="center">
                {showWindSpeed && <ControlLabel>Wind Speed (m/s)</ControlLabel>}
                {showWindSpeed && <HorizontalContainer>
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
                {showWindDirection && <HorizontalContainer>
                  <RangeControl
                    min={0}
                    max={360}
                    value={stagingWindDirection}
                    step={10}
                    tickStep={90}
                    width={this.props.width - 220}
                    onChange={this.changeWindDirection}
                  />
                </HorizontalContainer>}
              </VerticalContainer>
              <ValueContainer>
                <IconContainer>
                  <Icon
                    width={50}
                    height={50}
                    fill={"black"}
                  >
                    <WindSpeedDirectionIcon />
                  </Icon>
                </IconContainer>
                <ValueOutput>
                  <HorizontalContainer alignItems="center" justifyContent="center">
                  {showWindSpeed && <div>{stagingWindSpeed} m/s</div>}
                  {(showWindSpeed && showWindDirection) && <ValueDivider/ >}
                  {showWindDirection && <div>{stagingWindDirection} °</div>}
                  </HorizontalContainer>
                </ValueOutput>
              </ValueContainer>
            </HorizontalContainer>
          </ControlContainer>}
          {showEjectedVolume && <ControlContainer>
            <HorizontalContainer>
              <VerticalContainer alignItems="center" justifyContent="center">
                <ControlLabel>Ejected Volume (km<sup>3</sup>)</ControlLabel>
                <HorizontalContainer>
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
              <ValueContainer>
                <IconContainer>
                  <Icon
                    width={50}
                    height={50}
                    fill={"black"}
                  >
                    <EjectedVolumeIcon />
                  </Icon>
                </IconContainer>
                <ValueOutput>
                  <div
                    dangerouslySetInnerHTML={
                      {__html: `10<sup>${Math.round(Math.log(stagingMass) / Math.LN10) - 12}</sup> km<sup>3</sup>`}
                  } />
                </ValueOutput>
              </ValueContainer>
            </HorizontalContainer>
          </ControlContainer>}
          {showColumnHeight && <ControlContainer>
            <HorizontalContainer>
              <VerticalContainer alignItems="center" justifyContent="center">
                <ControlLabel>Column Height (km)</ControlLabel>
                <HorizontalContainer>
                  <RangeControl
                    min={1}
                    max={30}
                    value={stagingColHeight / 1000}
                    step={1}
                    tickArray={[1, 5, 10, 15, 20, 25, 30]}
                    width={this.props.width - 220}
                    onChange={this.changeColumnHeight}
                  />
                </HorizontalContainer>
              </VerticalContainer>
              <ValueContainer>
                <IconContainer>
                  <Icon
                    width={36}
                    height={40}
                    fill={"black"}
                  >
                    <ColumnHeightIcon/>
                  </Icon>
                </IconContainer>
                <ValueOutput>
                  {stagingColHeight / 1000} km
                </ValueOutput>
              </ValueContainer>
            </HorizontalContainer>
          </ControlContainer>}
          <NoteLabel>
            <span>Note: changes made here will </span>
            <BoldSpan>not be</BoldSpan>
            <span> reflected in your Blocks/Code.</span>
          </NoteLabel>
        </ControlsContainer>
        <EruptContainer>
          <EruptButtons>
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
            />
          </EruptButtons>
        </EruptContainer>
      </StyledControls>
    );
  }

  private changeWindDirection = (direction: number) => {
    this.stores.setWindDirection(direction);
  }

  private changeWindSpeed = (speed: number) => {
    this.stores.setWindSpeed(speed);
  }

  private changeColumnHeight = (heightInKilometers: number) => {
    this.stores.setColumnHeight(heightInKilometers);
  }

  private changeMass = (zeroBasedPower: number) => {
    // -4 index conversion, +9 km^3 to m^3, +3 m^3 to kg
    const massInKilograms = Math.pow(10, zeroBasedPower - 4 + 9 + 3);
    this.stores.setMass(massInKilograms);
  }

  private changeSize = (size: number) => {
    this.stores.setParticleSize(size);
  }

  private erupt = () => {
    this.stores.erupt(this.state.animate);
    this.stores.paintMap();

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

  private setAnimation = () => {
    this.setState(prevState => ({
      animate: !prevState.animate
    }));
  }
}

export default Controls;
