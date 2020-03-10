import * as React from "react";
import styled from "styled-components";
import RunIcon from "../../assets/blockly-icons/run.svg";
import StopIcon from "../../assets/blockly-icons/stop.svg";
import ResetIcon from "../../assets/blockly-icons/reset.svg";
import StepIcon from "../../assets/blockly-icons/step.svg";
import IconButton from "./icon-button";
import RangeControl from "../range-control";

interface IProps {
  run: () => void;
  stop: () => void;
  step: () => void;
  reset: () => void;
  running?: boolean;
  showSpeedControls?: boolean;
  speed?: number;
  setSpeed?: (speed: number) => void;
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

const SpeedSliderContainer = styled.div`
  margin: 0 50px 0 -100px;
`;

const SpeedSlider = (props: IProps) => {
  const { speed, setSpeed } = props;
  return (
    <SpeedSliderContainer>
      <RangeControl
        min={0}
        max={3}
        value={speed!}
        step={1}
        tickMap={{0: "Slow", 3: "Fast"}}
        width={100}
        onChange={setSpeed!}
      />
    </SpeedSliderContainer>
  );
};

export default class RunButtons extends React.Component<IProps, IState> {
  public render() {
    const { running, showSpeedControls, speed, setSpeed } = this.props;
    return (
      <ButtonContainer>
        {
          showSpeedControls &&
          <SpeedSlider {...this.props} />
        }
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
