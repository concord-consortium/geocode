import { PureComponent } from "react";
import CloseIcon from "../../assets/map-icons/close.svg";
import { AbsoluteIcon } from "./map-tephra-legend";
import styled from "styled-components";

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 125px;
  height: 185px;
`;

const LegendTitleText = styled.div`
  margin: 5px 11px 2px 0;
  color: #434343;
  font-size: 14px;
  font-weight: normal;
  width: 105px;
  height: 20px;
  box-sizing: border-box;
  text-align: center;
`;

export const GPSContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 108px;
  margin-top: 8px;
`;

export const GPSLabel = styled.div`
  color: #434343;
  font-size: 12px;
  font-weight: normal;
  flex: 1;
  margin-left: 7px;
  text-indent: -7px;
`;

export const GPSCircleContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 26px;
`;

export interface GPSCircleProps {
  radius: number;
  fill: string;
  strokeWeight: number;
  strokeColor: string;
}
export const GPSCircle = styled.div`
  border-radius: 50%;
  min-width: ${(p: GPSCircleProps) => `${2 * p.radius}px`};
  width: ${(p: GPSCircleProps) => `${2 * p.radius}px`};
  height: ${(p: GPSCircleProps) => `${2 * p.radius}px`};
  background-color: ${(p: GPSCircleProps) => `${p.fill}`};
  border: solid;
  border-width: ${(p: GPSCircleProps) => `${p.strokeWeight}px`};
  border-color: ${(p: GPSCircleProps) => `${p.strokeColor}`};
  margin-right: 5px;
`;

interface IProps {
  onClick: any;
}

interface IState {}

export default class GPSLegendComponent extends PureComponent<IProps, IState> {
  public static defaultProps = {
    onClick: undefined,
  };

  public render() {
    const { onClick } = this.props;
    return (
      <LegendContainer>
        <LegendTitleText>GPS Stations</LegendTitleText>
        <AbsoluteIcon
          width={28}
          height={28}
          fill={"#b7dcad"}
          onClick={onClick}
        >
          <CloseIcon width={12} height={12} />
        </AbsoluteIcon>
        <GPSContainer>
        <GPSCircleContainer>
          <GPSCircle
            radius={7}
            fill={"#98E643"}
            strokeColor={"#9c9c9c"}
            strokeWeight={2}
          />
        </GPSCircleContainer>
        <GPSLabel>- GPS station <span style={{fontWeight: "bold"}}>without</span> past position data</GPSLabel>
        </GPSContainer>
        <GPSContainer>
          <GPSCircleContainer>
          <GPSCircle
            radius={7}
            fill={"#37cfff"}
            strokeColor={"#9c9c9c"}
            strokeWeight={2}
          />
          </GPSCircleContainer>
          <GPSLabel>- GPS station <span style={{fontWeight: "bold"}}>with</span> past position data</GPSLabel>
        </GPSContainer>
        <GPSContainer>
          <GPSCircleContainer>
            <GPSCircle
              radius={9}
              fill={"#DDEDFF"}
              strokeColor={"#434343"}
              strokeWeight={3}
            />
          </GPSCircleContainer>
          <GPSLabel>- Selected GPS station</GPSLabel>
        </GPSContainer>
      </LegendContainer>
    );
  }
}
