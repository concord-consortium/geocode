import * as React from "react";
import { PureComponent } from "react";
import styled from "styled-components";
import { Icon } from "./icon";
import CloseIcon from "../assets/map-icons/close.svg";

export interface TephraRange {
  color: string;
  min: number;
  max: number | undefined;
}
export const TephraRanges: TephraRange[] = [
  {
    color: "#EEE270",
    min: 1,
    max: 3
  },
  {
    color: "#FFBF4E",
    min: 3,
    max: 10
  },
  {
    color: "#FF754B",
    min: 10,
    max: 30
  },
  {
    color: "#E94E83",
    min: 30,
    max: 100
  },
  {
    color: "#AE4ED3",
    min: 100,
    max: 300
  },
  {
    color: "#7B58AE",
    min: 300,
    max: 1000
  },
  {
    color: "#515A94",
    min: 1000,
    max: undefined
  },
];

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  box-sizing: border-box;
  top: 35px;
  right: 38px;
  width: 117px;
  height: 232px;
  border-radius: 5px;
  background-color: white;
  border: solid 2px white;
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.35);
`;

const LegendTitleText = styled.div`
  margin: 5px 11px 2px 11px;
  color: #434343;
  font-size: 14px;
  width: 95px;
  height: 34px;
  box-sizing: border-box;
  text-align: center;
`;

const AbsoluteIcon = styled(Icon)`
  position: absolute;
  top: 2px;
  right: 6px;
  &:hover {
    fill: #75cd75;
  }
  &:active {
    fill: #e6f2e4;
  }
`;

const TephraContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 97px;
  margin-top: 5px;
`;

interface TephraBoxProps {
  backgroundColor?: string;
}
const TephraBox = styled.div`
  width: 25px;
  height: 20px;
  box-sizing: border-box;
  border: solid 1px #979797;
  background-color: ${(p: TephraBoxProps) => `${p.backgroundColor ? `${p.backgroundColor}` : "#white"}`};
  margin-right: 2px;
`;

const TephraLabel = styled.div`
  color: #434343;
  font-size: 12px;
`;

interface IProps {
  onClick: any;
}

interface IState {}

export default class TephraLegendComponent extends PureComponent<IProps, IState> {
  public static defaultProps = {
    onClick: undefined,
  };

  public render() {
    const { onClick } = this.props;
    return (
      <LegendContainer>
        <LegendTitleText>Tephra Thickness (mm)</LegendTitleText>
        <AbsoluteIcon
          width={12}
          height={12}
          fill={"#b7dcad"}
          onClick={onClick}
        >
          <CloseIcon />
        </AbsoluteIcon>
        {TephraRanges.map((tephraRange, index) => {
            return (
              <TephraContainer key={index}>
                <TephraBox backgroundColor={tephraRange.color}/>
                { tephraRange.max
                  ? <TephraLabel>{`- ${tephraRange.min}-${tephraRange.max}`}</TephraLabel>
                  : <TephraLabel>{`- >${tephraRange.min}`}</TephraLabel>
                }
              </TephraContainer>
            );
        })}

      </LegendContainer>
    );
  }

}
