import * as React from "react";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../../base";
import styled from "styled-components";
import { IDeformationRuns, IDeformationModelInfo } from "../../../stores/seismic-simulation-store";
import { ButtonContainer, BlockInputsButtonText } from "./button-divs";
import { DialogContainer, InnerDialog } from "./block-inputs-dialog";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  position: absolute;
  top: 10px;
  right: 15px;
  width: 110px;
`;

const ExitButtonDiv = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  position: absolute;
  top: 0px;
  align-items: flex-end;
  justify-content: flex-end;
`

const ExitButton = styled.button`
  border: none;
  font-size: 18px;
  font-weight: bold;
  color: #96b48e;
  background-color: transparent;
  cursor: pointer;
`

interface IProps {
    running: boolean;
    deformationHistory: IDeformationRuns;
}

interface IState {
  activeRun: number;
  showInputs: boolean;
  currentRunInformation: IDeformationModelInfo;
}

const runButtonTopPositions = [45, 90, 135];
const runButtonColors = ["#66C2A4", "#FC8D62", "#8E9FCB"];

@inject("stores")
@observer
export default class BlockInputsMenu extends BaseComponent<IProps, IState> {
  constructor(props: IProps){
    super(props);
    this.state = {
      activeRun: 0,
      showInputs: false,
      currentRunInformation: {plate1Speed: 0, plate2Speed: 0},
    };
    this.setActiveRun = this.setActiveRun.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  public handleClick(){
    this.setState({showInputs: !this.state.showInputs});
  }

  public setActiveRun(runNumber: number, currentRunInfo: IDeformationModelInfo) {
    this.setState({activeRun: runNumber});
    this.setState({currentRunInformation: currentRunInfo});
    console.log(this.state);
  }

  public render() {
    const { running, deformationHistory } = this.props;
    const { activeRun, showInputs, currentRunInformation } = this.state;

    return (
      <Container>
        <ButtonContainer top={0} color={"#cee6c9"} onClick={this.handleClick}>
          <BlockInputsButtonText running={running}>Block Inputs</BlockInputsButtonText>
        </ButtonContainer>
        { showInputs ?
          <DialogContainer>
            <ExitButtonDiv>
              <ExitButton onClick={this.handleClick}>X</ExitButton>
            </ExitButtonDiv>
            <InnerDialog run={activeRun} deformationHistory={deformationHistory} currentRun={currentRunInformation}/>
          </DialogContainer>
          : <div/> }
        { deformationHistory.length ? deformationHistory.map((run, idx) => {
          return (
            <ButtonContainer
              key={idx}
              run={idx + 1}
              top={runButtonTopPositions[idx]}
              color={runButtonColors[idx]}
              typeOfButton={"run"}
              onClick={() => this.setActiveRun(run.group, run.deformationModelInfo)}
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
