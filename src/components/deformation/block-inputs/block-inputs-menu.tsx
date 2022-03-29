import * as React from "react";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../../base";
import styled from "styled-components";
import { IDeformationRuns } from "../../../stores/seismic-simulation-store";
import { ButtonContainer, BlockInputsButtonText } from "./button-divs";

export interface IButtonProps {
  running?: boolean;
  color?: string;
  top?: number;
  run?: number;
  typeOfButton?: string;
  onClick?: any;
  activeRun?: number | null;
}

interface IProps {
    running: boolean;
    runs: IDeformationRuns;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  position: absolute;
  top: 10px;
  right: 15px;
  width: 110px;
`;

interface IState {
  activeRun: number | null;
}

const runButtonTopPositions = [45, 90, 135];
const runButtonColors = ["#66C2A4", "#FC8D62", "#8E9FCB"];

@inject("stores")
@observer
export default class BlockInputsMenu extends BaseComponent<IProps, IState> {
  constructor(props: IProps){
    super(props);
    this.state = {
      activeRun: null,
    };
    this.setActiveRun = this.setActiveRun.bind(this);
  }

  public setActiveRun(runNumber: number) {
    this.setState({activeRun: runNumber});
  }

  public render() {
    const { running, runs } = this.props;
    const { activeRun } = this.state;

    return (
      <Container>
        <ButtonContainer top={0} color={"#cee6c9"}>
          <BlockInputsButtonText running={running}>Block Inputs</BlockInputsButtonText>
        </ButtonContainer>
        { runs.length ? runs.map((run, idx) => {
          return (
            <ButtonContainer
              key={idx}
              run={idx + 1}
              top={runButtonTopPositions[idx]}
              color={runButtonColors[idx]}
              typeOfButton={"run"}
              onClick={() => this.setActiveRun(run.group)}
              activeRun={activeRun!}
            >
              <BlockInputsButtonText
                className="buttonText"
                key={idx}
                run={idx + 1}
                running={running}
                color={runButtonColors[idx]}
                typeOfButton={"run"}
                activeRun={activeRun}
              >
                {"Run " + run.group}
              </BlockInputsButtonText>
            </ButtonContainer>);
        }) : <div/> }
      </Container>
    );
  }
}
