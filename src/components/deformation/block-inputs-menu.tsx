import * as React from "react";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";
import styled from "styled-components";
import { stores } from "../../stores/stores";
import { toJS } from "mobx";
import { IDeformationRuns } from "../../stores/seismic-simulation-store";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  position: absolute;
  top: 10px;
  right: 15px;
  width: 110px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: absolute;
  box-sizing: border-box;
  width: auto;
  height: auto;
  top: ${ p => p.top + "px" };
  border-radius: 5px;
  background-color: white;
  border: ${ p => "solid 2px" + p.color };
  padding: 5px;
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.35);
  &:hover {
    background-color: ${ p => p.color };
    border: solid 2px #FFF;
  }
  &:hover .buttonText {
    color: ${p => p.typeOfButton === "run" ? "#FFF" : "#000"};
  }
  &:active {
    background-color: ${p => p.typeOfButton === "run" ? p.color : "#e6f2e4"};
    border: ${p => p.typeOfButton === "run" ? "2px solid" + p.color : "2px solid #FFF"}
  }
  cursor: pointer;
`;

const BlockInputsButtonText = styled.div`
  color: ${ p => p.color ? p.color : "#000" };
  opacity: ${ p => p.running ? "25%" : "100%" };
  font-size: 16px;
  font-weight: bold;
`;

interface IProps {
    running: boolean;
    runs: IDeformationRuns;
}

interface IState {}

const runButtonTopPositions = [45, 90, 135];
const runButtonColors = ["#66C2A4", "#FC8D62", "#8E9FCB"];

@inject("stores")
@observer
export default class BlockInputsMenu extends BaseComponent<IProps, IState> {

  public render() {
    const { running, runs } = this.props;
    return (
      <Container>
        <ButtonContainer top={0} color={"#cee6c9"} typeOfButton={"blockInput"}>
          <BlockInputsButtonText running={running}>Block Inputs</BlockInputsButtonText>
        </ButtonContainer>
        { runs.length ? runs.map((run, idx) => {
          return <ButtonContainer key={idx} top={runButtonTopPositions[idx]} color={runButtonColors[idx]} typeOfButton={"run"}>
                  <BlockInputsButtonText
                      className="buttonText"
                      key={idx}
                      running={running}
                      color={runButtonColors[idx]}
                  >
                      {"Run " + run.group}
                  </BlockInputsButtonText>
                </ButtonContainer>;
        }) : <div/> }
      </Container>
    );
  }
}
