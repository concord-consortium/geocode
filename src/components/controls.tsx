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
  padding: 18px 28px 8px 28px;
  background-color: white;
`;

const ControlContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 5px;
  margin-bottom: 10px;
  border-radius: 10px;
  background-color: #F0F0F0;
  font-size: 16px;
`;

const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 104px;
  height: 84px;
  padding: 2px;
  margin-left: auto;
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
  border: 1px solid #BBB;
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
  showEruptionMass: boolean;
  showColumnHeight: boolean;
  showParticleSize: boolean;
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
      stagingColHeight,
      stagingWindSpeed
    } = this.stores;

    const {
      showWindSpeed,
      showWindDirection,
      showEruptionMass,
      showColumnHeight,
      showParticleSize
    } = this.props;

    return(
      <StyledControls>
        <ControlsContainer>
          {(showWindSpeed || showWindDirection) && <ControlContainer>
            <HorizontalContainer alignItems="center">
              <VerticalContainer alignItems="center" justifyContent="center">
                {showWindSpeed && <label>Wind Speed (m/s)</label>}
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
                {showWindDirection && <label>Wind Direction (° from North)</label>}
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
          {showParticleSize && <ControlContainer>
            <HorizontalContainer>
              <VerticalContainer alignItems="center" justifyContent="center">
                <label>Particle Size (mm)</label>
                <HorizontalContainer>
                  <RangeControl
                    min={1}
                    max={64}
                    value={stagingParticleSize}
                    step={1}
                    tickArray={[1, 10, 20, 30, 40, 50, 64]}
                    width={this.props.width - 220}
                    onChange={this.changeSize}
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
                    <ParticleIcon />
                  </Icon>
                </IconContainer>
                <ValueOutput>
                  {stagingParticleSize} mm
                </ValueOutput>
              </ValueContainer>
            </HorizontalContainer>
          </ControlContainer>}
          {showEruptionMass && <ControlContainer>
            <HorizontalContainer>
              <VerticalContainer alignItems="center" justifyContent="center">
                <label>Eruption Mass (kg)</label>
                <HorizontalContainer>
                  <RangeControl
                    min={8}
                    max={15}
                    value={Math.round(Math.log(stagingMass) / Math.LN10)}
                    step={1}
                    tickMap={{
                      8: "10<sup>8</sup>",
                      9: "10<sup>9</sup>",
                      10: "10<sup>10</sup>",
                      11: "10<sup>11</sup>",
                      12: "10<sup>12</sup>",
                      13: "10<sup>13</sup>",
                      14: "10<sup>14</sup>",
                      15: "10<sup>15</sup>",
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
                      {__html: `10<sup>${Math.round(Math.log(stagingMass) / Math.LN10)}</sup> kg`}
                  } />
                </ValueOutput>
              </ValueContainer>
            </HorizontalContainer>
          </ControlContainer>}
          {showColumnHeight && <ControlContainer>
            <HorizontalContainer>
              <VerticalContainer alignItems="center" justifyContent="center">
                <label>Column Height (km)</label>
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

  private changeColumnHeight = (height: number) => {
    this.stores.setColumnHeight(height * 1000);
  }

  private changeMass = (vei: number) => {
    const mass =  Math.pow(10, vei);
    this.stores.setMass(mass);
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
