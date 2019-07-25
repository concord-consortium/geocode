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
      stagingWindDirection,
      stagingParticleSize,
      stagingMass,
      stagingColHeight,
      stagingWindSpeed
    } = this.stores;

    return(
      <StyledControls>
        <label>
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
        </label>
        <label>
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
        </label>
        <HorizontalContainer
            alignItems="baseline">
          <Button onClick={this.erupt}>Erupt</Button>
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
