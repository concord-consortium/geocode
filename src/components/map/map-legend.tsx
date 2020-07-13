import * as React from "react";
import { BaseComponent, IBaseProps } from "../base";
import styled from "styled-components";
import IconButton from "../buttons/icon-button";
import TephraLegendComponent from "./map-tephra-legend";
import RiskLegendComponent from "./map-risk-legend";

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

interface IProps extends IBaseProps {
  onClick: any;
  showTephra: boolean;
}

interface IState {
  showTephra: boolean;
}

export class LegendComponent extends BaseComponent<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    const initialState: IState = {
      showTephra: this.props.showTephra,
    };

    this.state = initialState;
  }

  public render() {
    const { onClick } = this.props;
    return (
      <LegendContainer data-test="key-container">
        { this.state.showTephra
          ? <TephraLegendComponent onClick={onClick}/>
          : <RiskLegendComponent onClick={onClick}/>
        }
        <IconButton
          onClick={this.onLegendModeClick}
          disabled={false}
          label={this.state.showTephra ? "Show Risk" : "Show Tephra"}
          borderColor={"#ADD1A2"}
          hoverColor={"#ADD1A2"}
          activeColor={"#B7DCAD"}
          fontSize={"13px"}
          fill={"black"}
          width={26}
          height={26}
          dataTest={"map-key-toggle"}
        />
      </LegendContainer>
    );
  }

  private onLegendModeClick = () => {
    this.setState(prevState => ({
      showTephra: !prevState.showTephra
    }));
  }

}
