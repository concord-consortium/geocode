import { PureComponent } from "react";
import styled from "styled-components";
import { Icon } from "../icon";
import CloseIcon from "../../assets/map-icons/close.svg";

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

export const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 117px;
  height: 227px;
`;

export const LegendTitleText = styled.div`
  margin: 5px 11px 2px 11px;
  color: #434343;
  font-size: 14px;
  font-weight: normal;
  width: 95px;
  height: 34px;
  box-sizing: border-box;
  text-align: center;
`;

export const AbsoluteIcon = styled(Icon)`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  right: 0;
  &:hover {
    fill: #75cd75;
  }
  &:active {
    fill: #e6f2e4;
  }
  cursor: pointer;
`;

export const TephraContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 97px;
  margin-top: 5px;
`;

export interface TephraBoxProps {
  backgroundColor?: string;
}
export const TephraBox = styled.div`
  width: 25px;
  height: 20px;
  box-sizing: border-box;
  border: solid 1px #979797;
  background-color: ${(p: TephraBoxProps) => `${p.backgroundColor ? `${p.backgroundColor}` : "#white"}`};
  margin-right: 2px;
`;

export const TephraLabel = styled.div`
  color: #434343;
  font-size: 12px;
  font-weight: normal;
  margin-left: 3px;
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
          width={28}
          height={28}
          fill={"#b7dcad"}
          onClick={onClick}
        >
          <CloseIcon width={12} height={12} />
        </AbsoluteIcon>
        {TephraRanges.map((tephraRange, index) => {
            return (
              <TephraContainer key={index} data-test="tephra-key">
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
