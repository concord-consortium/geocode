
import * as React from "react";
import styled from "styled-components";

interface IProps {
  run: () => void;
  stop: () => void;
  step: () => void;
  reset: () => void;
  running?: boolean;
}

interface IState {}

const StyledButton = styled.div`
  padding: 0.25em;
  margin: 0.25em;
  border: 1px solid hsl(0, 0%, 25%);
  border-radius: 0.2em;
`;

const HighliteButton = styled(StyledButton)`
  background-color: ${(p: {selected?: boolean}) => p.selected ? "black" : "white"};
  color: ${(p: {selected?: boolean}) => p.selected ? "white" : "black"};
`;

const ButtonContainer = styled.div`
  padding: 1em;
  background-color: white;
  border-radius: 0.2em;
  display: flex;
  flex-direction: row;
`;

const RunButton = (props: IProps) => {
  const { run, running } = props;
  return (
    <HighliteButton onClick={run} selected={running}>Run</HighliteButton>
  );
};

const StepButton = (props: IProps) => {
  const { step } = props;
  return (
    <StyledButton onClick={step}>Step</StyledButton>
  );
};

const StopButton = (props: IProps) => {
  const { stop } = props;
  return (
    <StyledButton onClick={stop}>Stop</StyledButton>
  );
};

const ResetButton = (props: IProps) => {
  const { reset } = props;
  return (
    <StyledButton onClick={reset}>Reset</StyledButton>
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