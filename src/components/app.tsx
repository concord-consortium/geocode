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
      mass,
      windDirection,
      windSpeed,
      code,
      setBlocklyCode,
      colHeight,
      particleSize,
      numCols,
      numRows,
      data
    } = this.stores;
    return (
      <App>
        <BlocklyContianer setBlocklyCode={ setBlocklyCode} />
        <Simulation >
          <VolcanoComponent
            windDirection={ windDirection }
            windSpeed={ windSpeed }
            mass={ mass }
            colHeight={ colHeight }
            particleSize={ particleSize }
            numColumns={numCols}
            numRows={numRows}
            data={ data }
          />
          <Controls>
            <RangeControl
              min={0}
              max={6.2}
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
          </Controls>
          <div>${code}</div>
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
}
