import * as React from "react";
import styled from "styled-components";
import RunIcon from "../assets/blockly-icons/run.svg";
import StopIcon from "../assets/blockly-icons/stop.svg";
import ResetIcon from "../assets/blockly-icons/reset.svg";
import StepIcon from "../assets/blockly-icons/step.svg";
import IconButton from "./icon-button";

interface IProps {
  run: () => void;
  stop: () => void;
  step: () => void;
  reset: () => void;
  running?: boolean;
}

interface IState {}

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex: 0 0 44px;
`;

const RunButton = (props: IProps) => {
  const { run } = props;
  return (
    <IconButton
      onClick={run}
      disabled={false}
      children={<RunIcon />}
      label={"Run"}
      hoverColor={"#BBD9FF"}
      activeColor={"#DDEDFF"}
      fill={"#4AA9FF"}
      width={26}
      height={26}
      dataTest={"Run-button"}
    />
  );
};

const StepButton = (props: IProps) => {
  const { step } = props;
  return (
    <IconButton
      onClick={step}
      disabled={false}
      children={<StepIcon />}
      label={"Step"}
      hoverColor={"#BBD9FF"}
      activeColor={"#DDEDFF"}
      fill={"#4AA9FF"}
      width={26}
      height={26}
      dataTest={"Step-button"}
    />
  );
};

const StopButton = (props: IProps) => {
  const { stop } = props;
  return (
    <IconButton
      onClick={stop}
      disabled={false}
      children={<StopIcon />}
      label={"Stop"}
      hoverColor={"#BBD9FF"}
      activeColor={"#DDEDFF"}
      fill={"#4AA9FF"}
      width={26}
      height={26}
      dataTest={"Stop-button"}
    />
  );
};

const ResetButton = (props: IProps) => {
  const { reset } = props;
  return (
    <IconButton
      onClick={reset}
      disabled={false}
      children={<ResetIcon />}
      label={"Reset"}
      hoverColor={"#BBD9FF"}
      activeColor={"#DDEDFF"}
      fill={"#4AA9FF"}
      width={26}
      height={26}
      dataTest={"Reset-button"}
    />
  );
};

export default class RunButtons extends React.Component<IProps, IState> {
  public render() {
    const { running } = this.props;
    return (
      <ButtonContainer>
        { running
          ? <StopButton   {...this.props} />
          : <RunButton  {...this.props} />
        }
        <StepButton  {...this.props} />
        <ResetButton {...this.props} />
      </ButtonContainer>
    );
  }

}
