import * as React from "react";
import { PureComponent } from "react";
import styled from "styled-components";
import { Icon } from "./icon";

interface IconButtonContainerProps {
  hoverColor: string;
  activeColor: string;
}
const IconButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 83px;
  height: 34px;
  border-radius: 5px;
  background-color: white;
  border: solid 2px white;
  margin: 0 4px 0 4px;
  &:hover {
    background-color: ${(p: IconButtonContainerProps) => `${p.hoverColor}`};
  }
  &:active {
    background-color: ${(p: IconButtonContainerProps) => `${p.activeColor}`};
  }
`;

const IconButtonText = styled.div`
  margin-left: 4px;
  color: #434343;
  font-size: 16px;
  opacity: ${(p: {disabled?: boolean}) => p.disabled ? ".25" : "1"};
`;

interface IProps {
  onClick: any;
  disabled: any;
  label: string;
  hoverColor: string;
  activeColor: string;
  fill: string;
  width: number;
  height: number;
}

interface IState {}

export default class IconButton extends PureComponent<IProps, IState> {
  public static defaultProps = {
    onClick: undefined,
    disabled: undefined,
    label: undefined,
    hoverColor: undefined,
    activeColor: undefined,
    fill: undefined,
    width: undefined,
    height: undefined,
  };

  public render() {
    const { onClick, disabled, children, label, hoverColor, activeColor, fill, width, height } = this.props;
    return (
      <IconButtonContainer onClick={onClick} hoverColor={hoverColor} activeColor={activeColor}>
        <Icon
          width={width}
          height={height}
          fill={fill}
          disabled={disabled}
        >
          {children}
        </Icon>
        <IconButtonText disabled={disabled}>{label}</IconButtonText>
      </IconButtonContainer>
    );
  }
}
