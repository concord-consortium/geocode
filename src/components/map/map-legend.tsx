import * as React from "react";
import { BaseComponent, IBaseProps } from "../base";
import styled from "styled-components";
import IconButton from "../buttons/icon-button";
import TephraLegendComponent from "./map-tephra-legend";
import RiskLegendComponent from "./map-risk-legend";
import StrainLegendComponent from "./map-strain-legend";
import { ColorMethod } from "../../stores/seismic-simulation-store";

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  top: 35px;
  right: 38px;
  border-radius: 5px;
  background-color: white;
  border: solid 2px white;
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.35);
  padding-bottom: 5px;
`;

export type LegendType = "Tephra" | "Risk" | "Strain";

interface IProps extends IBaseProps {
  onClick: any;
  legendType: LegendType;
  colorMethod: ColorMethod;
}

interface IState {
  toggledToSecondary: boolean;
}

export class LegendComponent extends BaseComponent<IProps, IState> {

  public state = {
    toggledToSecondary: false
  };

  public render() {
    const { onClick, legendType, colorMethod } = this.props;
    const { toggledToSecondary } = this.state;
    const currentLegendType = legendType === "Tephra" && toggledToSecondary ? "Risk" :
                              legendType === "Risk" && toggledToSecondary ? "Tephra" :
                              legendType;
    const legend = currentLegendType === "Tephra" ? <TephraLegendComponent onClick={onClick} /> :
                    currentLegendType === "Risk" ? <RiskLegendComponent onClick={onClick} /> :
                    <StrainLegendComponent onClick={onClick} colorMethod={colorMethod} />;
    const showToggle = legendType === "Tephra" || legendType === "Risk";
    return (
      <LegendContainer data-test="key-container">
        {
          legend
        }
        {
          showToggle &&
          <IconButton
            onClick={this.onLegendModeClick}
            disabled={false}
            label={`Show ${currentLegendType === "Tephra" ? "Risk" : "Tephra"}`}
            borderColor={"#ADD1A2"}
            hoverColor={"#ADD1A2"}
            activeColor={"#B7DCAD"}
            fontSize={"13px"}
            fill={"black"}
            width={26}
            height={26}
            dataTest={"map-key-toggle"}
          />
        }
      </LegendContainer>
    );
  }

  private onLegendModeClick = () => {
    this.setState(prevState => ({
      toggledToSecondary: !prevState.toggledToSecondary
    }));
  }

}
