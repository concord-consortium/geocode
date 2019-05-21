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

const StyledButton = styled.div`
  padding: 0.25em;
  margin: 0.5em 1em;
  border: 1px solid hsl(0, 0%, 25%);
  border-radius: 0.2em;
`;

const HorizontalContainer = styled.div`
  display: flex;
  align-items: baseline;
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
        <RangeControl
          min={0}
          max={360}
          step={0.2}
          onChange={this.changeWindDirection}
          value={windDirection}
          name="Wind Direction"
        />
        <RangeControl
          min={0.1}
          max={5}
          step={0.1}
          onChange={this.changeSize}
          value={particleSize}
          name="Particle Size (1 - 10)"
        />
        <RangeControl
          min={10}
          max={30}
          step={0.1}
          value={Math.log(mass)}
          onChange={this.changeMass}
          name="Ejected Mass (10kg – 1e12 kg)"
        />
        <RangeControl
          min={2000}
          max={25000}
          value={colHeight}
          onChange={this.changeColumnHeight}
          name="Column Height (2km – 25km)"
        />
        <RangeControl
          min={0}
          max={20}
          step={0.1}
          value={windSpeed}
          onChange={this.changeWindSpeed}
          name="Wind Speed (m/s)"
        />
        <HorizontalContainer>
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

  private changeWindDirection = (input: React.FormEvent<HTMLInputElement>) => {
    const direction = parseFloat(input.currentTarget.value);
    this.stores.setWindDirection(direction);
  }

  private changeWindSpeed = (input: React.FormEvent<HTMLInputElement>) => {
    const speed = parseFloat(input.currentTarget.value);
    this.stores.setWindSpeed(speed);
  }

  private changeColumnHeight = (input: React.FormEvent<HTMLInputElement>) => {
    const height = parseFloat(input.currentTarget.value);
    this.stores.setColumnHeight(height);
  }

  private changeMass = (input: React.FormEvent<HTMLInputElement>) => {
    const massLog = parseFloat(input.currentTarget.value);
    const mass = Math.exp(massLog);
    this.stores.setMass(mass);
  }

  private changeSize = (input: React.FormEvent<HTMLInputElement>) => {
    const size = parseFloat(input.currentTarget.value);
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
