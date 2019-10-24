
import * as React from "react";
import styled from "styled-components";
import Button from "./overlay-button";

interface IProps {
  run: () => void;
  stop: () => void;
  step: () => void;
  reset: () => void;
  running?: boolean;
}

interface IState {}

const ButtonContainer = styled.div`
  padding: 1em;
  border-radius: 0.2em;
  display: flex;
  flex-direction: row;
`;

const RunButton = (props: IProps) => {
  const { run, running } = props;
  return (
    <Button onClick={run} color={running ? "primary" : "secondary"}>Run</Button>
  );
};

const StepButton = (props: IProps) => {
  const { step } = props;
  return (
    <Button onClick={step}>Step</Button>
  );
};

const StopButton = (props: IProps) => {
  const { stop } = props;
  return (
    <Button onClick={stop}>Stop</Button>
  );
};

const ResetButton = (props: IProps) => {
  const { reset } = props;
  return (
    <Button onClick={reset}>Reset</Button>
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
