import { clsx } from "clsx";
import React, { PureComponent } from "react";
import styled from "styled-components";
import { Icon } from "../icon";

interface IconButtonContainerProps {
  backgroundColor?: string;
  borderColor?: string;
  fontSize?: string;
  hoverColor: string;
  activeColor: string;
}
const IconButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  min-width: 83px;
  height: 34px;
  border-radius: 5px;
  background-color: ${(p: IconButtonContainerProps) => p.backgroundColor || "white"};
  border: solid 2px ${(p: IconButtonContainerProps) => p.borderColor || "white"};
  margin: 0 4px 0 4px;
  padding: 4px;
  &:hover {
    background-color: ${(p: IconButtonContainerProps) => p.hoverColor};
  }
  &:active, &.active {
    background-color: ${(p: IconButtonContainerProps) => p.activeColor};
  }
  font-size: ${(p: IconButtonContainerProps) => p.fontSize || "16px"};
  cursor: pointer;
`;

const IconButtonText = styled.div`
  margin-left: 4px;
  margin-right: 4px;
  color: #434343;
  opacity: ${(p: {disabled?: boolean}) => p.disabled ? ".25" : "1"};
`;

export interface IProps {
  className?: string;
  onClick: any;
  children?: React.ReactNode;
  disabled: any;
  isActive?: boolean;
  label: string;
  backgroundColor?: string;
  borderColor?: string;
  hoverColor: string;
  activeColor: string;
  fontSize?: string;
  fill: string;
  width: number;
  height: number;
  dataTest: string;
}

interface IState {}

export default class IconButton extends PureComponent<IProps, IState> {
  public static defaultProps = {
    className: undefined,
    onClick: undefined,
    disabled: undefined,
    isActive: undefined,
    label: undefined,
    backgroundColor: undefined,
    borderColor: undefined,
    hoverColor: undefined,
    activeColor: undefined,
    fill: undefined,
    width: undefined,
    height: undefined,
    dataTest: undefined,
  };

  public render() {
    const { className, onClick, disabled, children, label, backgroundColor, hoverColor, activeColor,
            borderColor, fontSize, fill, width, height, dataTest } = this.props;
    return (
      <IconButtonContainer
        className={clsx(className, { active: this.props.isActive })}
        onClick={!disabled ? onClick : undefined}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        fontSize={fontSize}
        hoverColor={!disabled ? hoverColor : backgroundColor || "white"}
        activeColor={!disabled ? activeColor : backgroundColor || "white"}
        data-test={dataTest}
      >
        { children &&
          <Icon
            width={width}
            height={height}
            fill={fill}
            disabled={disabled}
          >
            {children}
          </Icon>
        }
        <IconButtonText disabled={disabled}>{label}</IconButtonText>
      </IconButtonContainer>
    );
  }
}
