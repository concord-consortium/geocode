import * as React from "react";
import { PureComponent } from "react";
import styled from "styled-components";
import { Icon } from "./icon";
import CheckIcon from "../assets/controls-icons/check.svg";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 80px;
  top: 0px;
  width: 200px;
  height: 34px;
`;

const Checkbox = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: solid 1px white;
  padding: 0px;
  margin-right: 5px;
  background-color: white;
  text-decoration: none;
  &:hover {
    background-color: ${(p: {selected?: boolean}) => p.selected ? "#FFCA79" : "#FFDBAC"};
  }
  &:active {
    background-color: #FFECD6;
  }
`;

interface IProps {
  onClick: any;
  selected: any;
}

interface IState {}

export default class AnimateEruptionCheckbox extends PureComponent<IProps, IState> {
  public static defaultProps = {
    onClick: undefined,
    selected: undefined,
  };

  public render() {
    const { onClick, selected } = this.props;
    return (
      <Container>
        <Checkbox selected={selected} onClick={onClick}>
          <Icon
            width={12}
            height={14}
            fill={selected ? "#FFAC00" : "#FFFFFF"}
          >
            <CheckIcon />
          </Icon>
        </Checkbox>
        <div>Animate eruption</div>
      </Container>
    );
  }
}
