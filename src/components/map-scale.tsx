import * as React from "react";
import { PureComponent } from "react";
import styled from "styled-components";

const ScaleContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 4px;
  right: 28px;
`;

const ScaleText = styled.div`
  color: #434343;
  font-size: 12px;
  margin-bottom: 1px;
`;

interface ScaleProps {
  width: number;
}
const Scale = styled.div`
  width: ${(p: ScaleProps) => `${p.width}px`};
  height: 1px;
  background-color: #434343;
`;

interface IProps {
  label: string;
  width: number;
}

interface IState {}

export default class ScaleComponent extends PureComponent<IProps, IState> {
  public static defaultProps = {
    label: undefined,
    width: undefined,
  };

  public render() {
    const { label, width } = this.props;
    return (
      <ScaleContainer>
        <ScaleText>{label}</ScaleText>
        <Scale width={width}/>
      </ScaleContainer>
    );
  }
}
