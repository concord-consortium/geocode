import * as React from "react";
import { PureComponent } from "react";
import styled from "styled-components";
import { Icon } from "./icon";
import KeyIcon from "../assets/map-icons/key.svg";

const KeyButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  box-sizing: border-box;
  top: 35px;
  right: 38px;
  width: 71px;
  height: 34px;
  border-radius: 5px;
  background-color: white;
  border: solid 2px white;
  margin: 0;
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.35);
  &:hover {
    background-color: #cee6c9;
  }
  &:active {
    background-color: #e6f2e4;
  }
`;

const KeyButtonText = styled.div`
  margin-left: 4px;
  color: #434343;
  font-size: 16px;
`;

interface IProps {
  onClick: any;
}

interface IState {}

export default class KeyButton extends PureComponent<IProps, IState> {
  public static defaultProps = {
    onClick: undefined,
  };

  public render() {
    const { onClick } = this.props;
    return (
      <KeyButtonContainer onClick={onClick}>
        <Icon
          width={26}
          height={26}
          fill={"#75cd75"}
        >
          <KeyIcon />
        </Icon>
        <KeyButtonText>Key</KeyButtonText>
      </KeyButtonContainer>
    );
  }
}
