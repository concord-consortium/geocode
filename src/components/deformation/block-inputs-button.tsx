import * as React from "react";
import { PureComponent } from "react";
import styled from "styled-components";

const BlockInputsButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  box-sizing: border-box;
  top: 10px;
  right: 15px;
  width: 100px;
  height: 34px;
  border-radius: 5px;
  background-color: white;
  border: solid 2px #cee6c9;
  margin: 0;
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.35);
  &:hover {
    background-color: #cee6c9;
    border: solid 2px #fff;
  }
  &:active {
    background-color: #e6f2e4;
  }
  cursor: pointer;
`;

const BlockInputsButtonText = styled.div`
  margin-left: 4px;
  color: #434343;
  font-size: 16px;
`;

interface IProps {
  onClick: any;
}

interface IState {}

export default class BlockInputsButton extends PureComponent<IProps, IState> {

  public static defaultProps = {
    onClick: undefined,
  };

  public render() {
    return (
      <BlockInputsButtonContainer>
        <BlockInputsButtonText>Block Inputs</BlockInputsButtonText>
      </BlockInputsButtonContainer>
    );
  }
}
