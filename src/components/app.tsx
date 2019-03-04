import { inject, observer } from "mobx-react";
import * as React from "react";
import { BaseComponent, IBaseProps } from "./base";
import { VolcanoComponent } from "./volcano-component";
import RangeControl from "./range-control";
import BlocklyContianer from "./blockly-container";

import styled from "styled-components";

interface IProps extends IBaseProps {}

interface IState {}

const App = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    flex-direction: row;
    margin-top: 50px;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const Simulation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;
@inject("stores")
@observer
export class AppComponent extends BaseComponent<IProps, IState> {
  public render() {
    const {
      windDirection,
      windSpeed,
      code,
      setCanvas,
      setBlocklyCode
    } = this.stores;
    return (
      <App>
        <BlocklyContianer setBlocklyCode={ setBlocklyCode} />
        <Simulation >
          <VolcanoComponent
            windDirection={ windDirection }
            windSpeed={ windSpeed }
            setCanvas={ setCanvas }
          />
          <Controls>
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
          </Controls>
        </Simulation>
      </App>
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
}
