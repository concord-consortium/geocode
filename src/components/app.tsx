import { inject, observer } from "mobx-react";
import * as React from "react";
import { BaseComponent, IBaseProps } from "./base";
import { VolcanoComponent } from "./volcano-component";
import RangeControl from "./range-control";
import styled from "styled-components";

interface IProps extends IBaseProps {}
interface IState {}

const AppDiv = styled.div`
  display: flex;
  flex-direction: row;
`;

const ControlsDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

@inject("stores")
@observer

export class AppComponent extends BaseComponent<IProps, IState> {
  public render() {
    const {simulation} = this.stores;
    return (
      <AppDiv>
        <VolcanoComponent
          windDirection={simulation.windDirection}
          windSpeed={simulation.windSpeed}
        />
        <ControlsDiv>
          <RangeControl
            min={0}
            max={6.2}
            step={0.2}
            onChange={this.changeWindDirection}
            name="Wind Direction"
          />
          <RangeControl
            min={0}
            max={500}
            onChange={this.changeWindSpeed}
            name="Wind Speed"
          />
        </ControlsDiv>
      </AppDiv>
    );
  }
  private changeWindDirection = (input: React.FormEvent<HTMLInputElement>) => {
    const direction = parseFloat(input.currentTarget.value);
    this.stores.simulation.setWindDirection(direction);
    console.log(direction);
    console.log(this.stores.simulation.windDirection);
  }
  private changeWindSpeed = (input: React.FormEvent<HTMLInputElement>) => {
    const speed = parseFloat(input.currentTarget.value);
    this.stores.simulation.setWindSpeed(speed);
    console.log(speed);
    console.log(this.stores.simulation.windSpeed);
  }
}