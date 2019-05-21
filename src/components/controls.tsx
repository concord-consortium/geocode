import * as React from "react";
import { BaseComponent, IBaseProps } from "./base";
import { inject, observer } from "mobx-react";
import RangeControl from "./range-control";
import styled from "styled-components";

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

const StyledButton = styled.div`
  padding: 0.25em;
  margin: 0.5em 1em;
  border: 1px solid hsl(0, 0%, 25%);
  border-radius: 0.2em;
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

interface IProps extends IBaseProps {}
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
      windDirection,
      particleSize,
      mass,
      colHeight,
      windSpeed
    } = this.stores;

    return(
      <StyledControls>
        <label>
          Wind speed:
          <HorizontalContainer>
            <RangeControl
              min={0}
              max={30}
              value={windSpeed}
              step={1}
              tickStep={5}
              width={300}
              onChange={this.changeWindSpeed}
            />
            <ValueOutput>
              {windSpeed} m/s
            </ValueOutput>
          </HorizontalContainer>
        </label>
        <label>
          Wind direction:
          <HorizontalContainer>
            <RangeControl
              min={0}
              max={360}
              value={windDirection}
              step={10}
              tickStep={90}
              width={300}
              onChange={this.changeWindDirection}
            />
            <ValueOutput>
              {windDirection} degrees from North
            </ValueOutput>
          </HorizontalContainer>
        </label>
        <label>
          Eruption mass:
          <HorizontalContainer>
            <RangeControl
              min={8}
              max={15}
              value={Math.round(Math.log(mass) / Math.LN10)}
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
                {__html: `10<sup>${Math.round(Math.log(mass) / Math.LN10)}</sup> kg`}
            } />
          </HorizontalContainer>
        </label>
        <label>
          Column height
          <HorizontalContainer>
            <RangeControl
              min={1}
              max={30}
              value={colHeight / 1000}
              step={1}
              tickArray={[1, 5, 10, 15, 20, 25, 30]}
              width={300}
              onChange={this.changeColumnHeight}
            />
            <ValueOutput>
              {colHeight / 1000} km
            </ValueOutput>
          </HorizontalContainer>
        </label>
        <label>
          Particle size:
          <HorizontalContainer>
            <RangeControl
              min={1}
              max={64}
              value={particleSize}
              step={1}
              tickArray={[1, 10, 20, 30, 40, 50, 64]}
              width={300}
              onChange={this.changeSize}
            />
            <ValueOutput>
              {particleSize} mm
            </ValueOutput>
          </HorizontalContainer>
        </label>
        <HorizontalContainer
            alignItems="baseline">
          <StyledButton onClick={this.erupt}>Erupt</StyledButton>
          <label>
            <input
              name="animate eruption"
              type="checkbox"
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
    if (this.state.animate) {
      setTimeout(() => {
        this.stores.endEruption();
        this.stores.paintGrid("thickness", "#ff0000");
      }, 3000);
    } else {
      this.stores.paintGrid("thickness", "#ff0000");
    }
  }

  private setAnimation = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      animate: event.target.checked
    });
  }
}

export default Controls;
