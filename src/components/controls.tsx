import * as React from "react";
import { BaseComponent, IBaseProps } from "./base";
import { inject, observer } from "mobx-react";
import RangeControl from "./range-control";
import styled from "styled-components";
import Button from "./overlay-button";
import Checkbox from "@material-ui/core/Checkbox";
import ReactSVG from "react-svg";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import theme from "./checkbox-theme";

const StyledControls = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 100%;
  box-sizing: border-box;
  padding: 18px 28px 8px 28px;
  justify-content: center;
  align-items: center;
`;
const ControlContainer = styled.div`
  background-color: #F0F0F0;
  width: 100%;
  box-sizing: border-box;
  padding: 5px;
  border-radius: 10px;
  margin-bottom: 10px;
  font-size: 16px;
`;

const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 104px;
  height: 84px;
  border-radius: 8px;
  background-color: #FFDBAC;
  padding: 2px;
  margin-left: auto;
  justify-content: center;
  align-items: center;
`;

const ValueOutput = styled.div`
  font-size: 12px;
  box-sizing: border-box;
  border: 1px solid #BBB;
  border-radius: 0 0 8px 8px;
  background-color: white;
  width: 100%;
  margin-top: auto;
  text-align: center;
`;

const IconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

interface IconProps {
  width: number;
  height: number;
  fill: string;
}
const Icon = styled.div`
  width: ${(p: IconProps) => `${p.width}px`};
  height: ${(p: IconProps) => `${p.height}px`};
  fill: ${(p: IconProps) => `${p.fill}`};
  justify-content: center;
  align-items: center;
`;

interface HorizontalContainerProps {
  alignItems?: string;
}
const HorizontalContainer = styled.div`
  display: flex;
  align-items: ${(p: HorizontalContainerProps) => `${p.alignItems ? p.alignItems : "flex-start"}`};
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
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const EruptButton = styled.div`
  display: flex;
  background-color: white;
  width: 83px;
  height: 34px;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
`;

const NoteLabel = styled.label`
  font-size: 13px;
  font-style: italic;
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
                <label>Wind Speed (m/s)</label>
                <HorizontalContainer>
                  <RangeControl
                    min={0}
                    max={30}
                    value={stagingWindSpeed}
                    step={1}
                    tickStep={5}
                    width={this.props.width - 220}
                    onChange={this.changeWindSpeed}
                  />
                </HorizontalContainer>
                <label>Wind Direction (° from North)</label>
                <HorizontalContainer>
                  <RangeControl
                    min={0}
                    max={360}
                    value={stagingWindDirection}
                    step={10}
                    tickStep={90}
                    width={this.props.width - 220}
                    onChange={this.changeWindDirection}
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
                    <ReactSVG src="./icons/wind-speed-direction.svg" />
                  </Icon>
                </IconContainer>
                <ValueOutput>
                  {stagingWindSpeed} m/s | {stagingWindDirection} °
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
                    <ReactSVG src="./icons/particle.svg" />
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
                    <ReactSVG src="./icons/ejected-volume.svg" />
                  </Icon>
                </IconContainer>
                <ValueOutput
                  dangerouslySetInnerHTML={
                    {__html: `10<sup>${Math.round(Math.log(stagingMass) / Math.LN10)}</sup> kg`}
                } />
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
                    width={50}
                    height={50}
                    fill={"black"}
                  >
                    <ReactSVG src="./icons/column-height.svg" />
                  </Icon>
                </IconContainer>
                <ValueOutput>
                  {stagingColHeight / 1000} km
                </ValueOutput>
              </ValueContainer>
            </HorizontalContainer>
          </ControlContainer>}
          <NoteLabel>Changes made here will not be reflected in your Blocks/Code.</NoteLabel>
        </ControlsContainer>
        <EruptContainer>
          <EruptButton onClick={this.erupt}>
            <Icon
              width={30}
              height={30}
              fill={"#FFAC00"}
            >
              <ReactSVG src="./icons/run.svg" />
            </Icon>
            <label>Erupt</label>
          </EruptButton>
          <label>
            <MuiThemeProvider theme={theme}>
              <Checkbox
                name="animate eruption"
                checked={this.state.animate}
                onChange={this.setAnimation} />
            </MuiThemeProvider>
            Animate eruption
          </label>
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

  private setAnimation = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      animate: event.target.checked
    });
  }
}

export default Controls;
