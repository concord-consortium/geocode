import * as React from "react";
import styled from "styled-components";
import RunIcon from "../assets/blockly-icons/run.svg";
import StopIcon from "../assets/blockly-icons/stop.svg";
import ResetIcon from "../assets/blockly-icons/reset.svg";
import StepIcon from "../assets/blockly-icons/step.svg";
import { Icon } from "./icon";
import { IconButton, IconButtonText } from "./icon-button";

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
  height: 44px;
`;

const RunButton = (props: IProps) => {
  const { run, running } = props;
  return (
    <IconButton onClick={run} hovercolor="#BBD9FF" activecolor="#DDEDFF">
      <Icon
        width={26}
        height={26}
        fill={"#4AA9FF"}
      >
        <RunIcon />
      </Icon>
      <IconButtonText>Run</IconButtonText>
    </IconButton>
  );
};

const StepButton = (props: IProps) => {
  const { step } = props;
  return (
    <IconButton onClick={step} hovercolor="#BBD9FF" activecolor="#DDEDFF">
      <Icon
        width={26}
        height={26}
        fill={"#4AA9FF"}
      >
        <StepIcon />
      </Icon>
      <IconButtonText>Step</IconButtonText>
    </IconButton>
  );
};

const StopButton = (props: IProps) => {
  const { stop } = props;
  return (
    <IconButton onClick={stop} hovercolor="#BBD9FF" activecolor="#DDEDFF">
      <Icon
        width={26}
        height={26}
        fill={"#4AA9FF"}
      >
        <StopIcon />
      </Icon>
      <IconButtonText>Stop</IconButtonText>
    </IconButton>
  );
};

const ResetButton = (props: IProps) => {
  const { reset } = props;
  return (
    <IconButton onClick={reset} hovercolor="#BBD9FF" activecolor="#DDEDFF">
      <Icon
        width={26}
        height={26}
        fill={"#4AA9FF"}
      >
        <ResetIcon />
      </Icon>
      <IconButtonText>Reset</IconButtonText>
    </IconButton>
  );
};

export default class RunButtons extends React.Component<IProps, IState> {
  public render() {
    return (
      <ButtonContainer>
        <RunButton   {...this.props} />
        <StepButton  {...this.props} />
        <StopButton  {...this.props} />
        <ResetButton {...this.props} />
      </ButtonContainer>
    );
  }

}
