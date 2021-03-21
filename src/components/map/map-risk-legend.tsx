import * as React from "react";
import { PureComponent } from "react";
import styled from "styled-components";
import CloseIcon from "../../assets/map-icons/close.svg";
import { isNumber } from "util";
import { RiskLevels } from "../montecarlo/monte-carlo";
import { AbsoluteIcon } from "./map-tephra-legend";

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 165px;
  height: 185px;
`;

const LegendTitleText = styled.div`
  margin: 5px 11px 2px 11px;
  color: #434343;
  font-size: 14px;
  font-weight: normal;
  width: 105px;
  height: 20px;
  box-sizing: border-box;
  text-align: center;
`;

const LegendTitleSubText = styled.div`
  margin: 2px 11px 5px 11px;
  color: #434343;
  font-size: 11px;
  font-weight: normal;
  width: 120px;
  height: 30px;
  box-sizing: border-box;
  text-align: center;
  font-style: italic;
`;

const RiskContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 140px;
  height: 34px;
  margin-bottom: 5px;
`;

interface RiskDiamondProps {
  backgroundColor?: string;
}
export const RiskDiamond = styled.div`
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  border: solid 1px #979797;
  background-color: ${(p: RiskDiamondProps) => `${p.backgroundColor ? `${p.backgroundColor}` : "#white"}`};
  margin-right: 12px;
  transform: rotate(45deg);
  border: 2px solid #A1A1A1;
  border-radius: 4px;
`;
export const RiskDiamondText = styled.div`
  width: 24px;
  height: 24px;
  transform: rotate(-45deg);
  font-size: 20px;
  font-weight: bold;
  color: white;
  line-height: 16px;
  text-align: center;
`;

const RiskLabel = styled.div`
  color: #434343;
  font-size: 12px;
  font-weight: normal;
  margin-left: -3px;
`;

interface IProps {
  onClick: () => void;
}

interface IState {}

export default class RiskLegendComponent extends PureComponent<IProps, IState> {
  public static defaultProps = {
    onClick: undefined,
  };

  public render() {
    const { onClick } = this.props;
    return (
      <LegendContainer>
        <LegendTitleText>Risk Level</LegendTitleText>
        <LegendTitleSubText>Determined by percents exceeding threshold</LegendTitleSubText>
        <AbsoluteIcon
          width={28}
          height={28}
          fill={"#b7dcad"}
          onClick={onClick}
        >
          <CloseIcon width={12} height={12} />
        </AbsoluteIcon>
        {RiskLevels.map((riskLevel, index) => {
            return (
              <RiskContainer key={"risk" + index}>
                <RiskDiamond backgroundColor={riskLevel.iconColor}>
                  <RiskDiamondText>
                    {riskLevel.iconText}
                  </RiskDiamondText>
                </RiskDiamond>
                { isNumber(riskLevel.max) && isNumber(riskLevel.min)
                  ? <RiskLabel>{`- ${riskLevel.type} (${riskLevel.min}-${riskLevel.max}%)`}</RiskLabel>
                  : <RiskLabel>{`- ${riskLevel.type}`}</RiskLabel>
                }
              </RiskContainer>
            );
        })}
      </LegendContainer>
    );
  }
}
