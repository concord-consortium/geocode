import * as React from "react";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../../base";
import styled from "styled-components";
import { IDeformationRuns, IDeformationModelInfo } from "../../../stores/seismic-simulation-store";
import { ButtonContainer, RunButtonContainer, ButtonText } from "./button-divs";
import { DialogContainer, InnerDialog } from "./block-inputs-dialog";
import { ExitButtonDiv, ExitButton } from "./block-inputs-exit-buttons";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  position: absolute;
  top: 10px;
  right: 15px;
  width: 110px;
`;

interface IProps {
    running: boolean;
    deformationHistory: IDeformationRuns;
    currentRunNumber: number;
}

interface IState {
  showInputs: boolean;
}

const blockInputButtonColor = "#CEE6C9";
const runButtonTopPositions = [45, 90, 135];
const runButtonColors = ["#66C2A4", "#FC8D62", "#8E9FCB"];

@inject("stores")
@observer
export default class BlockInputsMenu extends BaseComponent<IProps, IState> {
  constructor(props: IProps){
    super(props);
    this.state = {
      showInputs: false,
    };
    this.setActiveRun = this.setActiveRun.bind(this);
    this.toggleBlockInputs = this.toggleBlockInputs.bind(this);
  }

  public toggleBlockInputs(){
    this.setState({showInputs: !this.state.showInputs});
  }

  public setActiveRun(runNumber: number, runDeformationModelInfo: IDeformationModelInfo) {
    this.stores.seismicSimulation.setDeformationCurrentRunNumber(runNumber);
    this.stores.seismicSimulation.setApparentYear(runDeformationModelInfo.year);
    this.stores.seismicSimulation.setPlateVelocity(1, runDeformationModelInfo.plate1Speed, 0);
    this.stores.seismicSimulation.setPlateVelocity(2, runDeformationModelInfo.plate2Speed, 180);
  }

  public render() {
    const { running, deformationHistory, currentRunNumber } = this.props;
    const { showInputs } = this.state;

    return (
      <Container>
        <ButtonContainer
          top={0}
          color={blockInputButtonColor}
          onClick={this.toggleBlockInputs}
          disabled={running || !deformationHistory.length}
          running={running}
        >
          <ButtonText
            running={running}
            disabled={running || !deformationHistory.length}
          >
            Block Inputs
          </ButtonText>
        </ButtonContainer>
        { showInputs ?
          <DialogContainer>
            <ExitButtonDiv>
              <ExitButton onClick={this.toggleBlockInputs}>X</ExitButton>
            </ExitButtonDiv>
            <InnerDialog
              runNumber={currentRunNumber}
              deformationHistory={deformationHistory}
            />
          </DialogContainer>
          : <div/> }
        { deformationHistory.length ? deformationHistory.map((run, idx) => {
          return (
            <RunButtonContainer
              running={running}
              key={idx}
              run={run.group}
              top={runButtonTopPositions[idx]}
              color={runButtonColors[idx]}
              typeOfButton={"run"}
              onClick={() => this.setActiveRun(run.group, run.deformationModelInfo)}
              activeRun={currentRunNumber}
              disabled={running ? true : false}
            >
              <ButtonText
                className="buttonText"
                key={idx}
                run={run.group}
                running={running}
                color={runButtonColors[idx]}
                typeOfButton={"run"}
                activeRun={currentRunNumber}
              >
                {"Run " + run.group}
              </ButtonText>
            </RunButtonContainer>);
        }) : <div/> }
      </Container>
    );
  }
}
