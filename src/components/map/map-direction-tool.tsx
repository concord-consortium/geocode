import * as React from "react";
import Draggable from "react-draggable";
import { BaseComponent } from "../base";
import styled from "styled-components";
import { Icon } from "../icon";
import CloseIcon from "../../assets/map-icons/close.svg";
import ArrowIcon from "../../assets/map-icons/arrow.svg";
import DirectionIcon from "../../assets/map-icons/compass.svg";
import RangeControl from "../../components/range-control";

const DirectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  top: 35px;
  left: calc(75% - 100px);
  width: 200px;
  height: 346px;
  padding: 2px;
  border-radius: 5px;
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.35);
  background-color: white;
  z-index: 99;
`;

const DirectionTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #434343;
  font-size: 14px;
  width: 100%;
  height: 24px;
  background-color: #e6f2e4;
  cursor: move;
`;

const SubTitle = styled.div`
  font-size: 12px;
  margin: 5px 0 9px 0;
`;

const CurrentDirection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 11px 16px 9px;
  font-size: 12px;
  width: 164px;
  height: 24px;
  border-radius: 5px;
  background-color: #ddedff;
`;

const Direction = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 32px;
`;

const Instructions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 140px;
  height: 15px;
  font-size: 12px;
  font-style: italic;
`;

const CardinalContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 165px;
  justify-content: space-between;
  font-size: 10px;
  margin-top: -10px;
  margin-bottom: 10px;
`;

const CloseIconContainer = styled(Icon)`
  position: absolute;
  top: 5px;
  right: 7px;
  &:hover {
    fill: #75cd75;
  }
  &:active {
    fill: #e6f2e4;
  }
  cursor: pointer;
`;

const ArrowIconContainer = styled(Icon)`
  position: absolute;
  top: -39px;
  left: -2px;
`;

interface RotateProps {
  rotate?: number;
}
const RotateDiv = styled.div`
  position: absolute;
  top: 121px;
  left: 103px;
  height: 10px;
  width: 10px;
  transform: ${(p: RotateProps) => `rotate(${p.rotate || 0}deg)`};
`;

interface IProps {
  onClose: () => void;
}

interface IState {
  direction: number;
}

export class MapDirectionTool extends BaseComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    const initialState: IState = {
      direction: 0,
    };
    this.state = initialState;
  }

  public render() {
    const { onClose } = this.props;
    const { direction } = this.state;
    return (
      <Draggable handle=".handle" bounds={"#reactApp"}>
        <DirectionContainer>
          <DirectionTitle className="handle">
            Explore: Direction
            <CloseIconContainer
              width={12}
              height={12}
              fill={"#b7dcad"}
              onClick={onClose}
            >
              <CloseIcon />
            </CloseIconContainer>
          </DirectionTitle>
          <SubTitle>Direction from North in degrees</SubTitle>
          <DirectionIcon />
          <RotateDiv rotate={direction}>
          <ArrowIconContainer width={14} height={44} fill={"#3387ff"}>
            <ArrowIcon />
          </ArrowIconContainer>
          </RotateDiv>
          <CurrentDirection>
            Direction =
            <Direction>{direction % 360}°</Direction>
            from 0° (N)
          </CurrentDirection>
          <RangeControl
            min={0}
            max={360}
            value={direction}
            step={10}
            tickMap={{
              0: "0",
              90: "90",
              180: "180",
              270: "270",
              360: "0",
            }}
            width={150}
            onChange={this.handleDirectionChange}
            trackColor={"#3387ff"}
            trackBorderColor={"#bbd9ff"}
          />
          <CardinalContainer>
            <div>(N)</div>
            <div>(E)</div>
            <div>(S)</div>
            <div>(W)</div>
            <div>(N)</div>
          </CardinalContainer>
          <Instructions>Use the slider to move</Instructions>
          <Instructions>the arrow from 0° (North).</Instructions>
        </DirectionContainer>
      </Draggable>
    );
  }

  private handleDirectionChange = (direction: number) => {
    this.setState({ direction });
  }
}
