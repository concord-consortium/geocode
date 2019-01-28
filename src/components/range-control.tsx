
import * as React from "react";
import styled from "styled-components";

interface IProps {
  min: number;
  max: number;
  step?: number;
  onChange?: (input: React.FormEvent<HTMLInputElement>) => void;
  name: string;
}

interface IState {}

const ControlGroup = styled.div`
  margin: 0.5em;
`;

const InputLabel = styled.label`
  padding-left: 1em;
`;

export default class RangeControl extends React.Component<IProps, IState> {
  public render() {
    const {min, max, step, onChange, name} = this.props;
    return (
      <ControlGroup>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          name={name}
        />
        <InputLabel>{name}</InputLabel>
      </ControlGroup>
    );
  }

}
