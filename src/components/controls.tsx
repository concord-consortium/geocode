import * as React from "react";
import { BaseComponent, IBaseProps } from "./base";
import { inject, observer } from "mobx-react";
import RangeControl from "./range-control";
import styled from "styled-components";
import { StyledButton } from "./styled-button";
import Button from "./overlay-button";
import Checkbox from "@material-ui/core/Checkbox";

const StyledControls = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const ValueOutput = styled.div`
  margin: 0.5em 1em;
  padding: 3px 14px;
  border: 1px solid #BBB;
  border-radius: 4px;
  background-color: #F1F1F1;
`;

interface HorizontalContainerProps {
  alignItems?: string;
}
const HorizontalContainer = styled.div`
  display: flex;
  align-items: ${(p: HorizontalContainerProps) => `${p.alignItems ? p.alignItems : "flex-start"}`};
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
        {showWindSpeed && <label>
          Wind speed:
          <HorizontalContainer>
            <RangeControl
              min={0}
              max={30}
              value={stagingWindSpeed}
              step={1}
              tickStep={5}
              width={300}
              onChange={this.changeWindSpeed}
            />
            <ValueOutput>
              {stagingWindSpeed} m/s
            </ValueOutput>
          </HorizontalContainer>
        </label>}
        {showWindDirection && <label>
          Wind direction:
          <HorizontalContainer>
            <RangeControl
              min={0}
              max={360}
              value={stagingWindDirection}
              step={10}
              tickStep={90}
              width={300}
              onChange={this.changeWindDirection}
            />
            <ValueOutput>
              {stagingWindDirection} degrees from North
            </ValueOutput>
          </HorizontalContainer>
        </label>}
        {showEruptionMass && <label>
          Eruption mass:
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
              width={300}
              onChange={this.changeMass}
            />
            <ValueOutput
              dangerouslySetInnerHTML={
                {__html: `10<sup>${Math.round(Math.log(stagingMass) / Math.LN10)}</sup> kg`}
            } />
          </HorizontalContainer>
        </label>}
        {showColumnHeight && <label>
          Column height
          <HorizontalContainer>
            <RangeControl
              min={1}
              max={30}
              value={stagingColHeight / 1000}
              step={1}
              tickArray={[1, 5, 10, 15, 20, 25, 30]}
              width={300}
              onChange={this.changeColumnHeight}
            />
            <ValueOutput>
              {stagingColHeight / 1000} km
            </ValueOutput>
          </HorizontalContainer>
        </label>}
        {showParticleSize && <label>
          Particle size:
          <HorizontalContainer>
            <RangeControl
              min={1}
              max={64}
              value={stagingParticleSize}
              step={1}
              tickArray={[1, 10, 20, 30, 40, 50, 64]}
              width={300}
              onChange={this.changeSize}
            />
            <ValueOutput>
              {stagingParticleSize} mm
            </ValueOutput>
          </HorizontalContainer>
        </label>}
        <HorizontalContainer
            alignItems="baseline">
          <Button onClick={this.erupt}>Erupt</Button>
          <label>
            <Checkbox
              name="animate eruption"
              checked={this.state.animate}
              onChange={this.setAnimation} />
            Animate eruption
          </label>
        </HorizontalContainer>
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
