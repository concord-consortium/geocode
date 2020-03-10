import * as React from "react";
import { PureComponent } from "react";
import styled from "styled-components";
import { Icon } from "../icon";
import CloseIcon from "../../assets/map-icons/close.svg";
import { isNumber } from "util";
import { RiskLevels } from "../montecarlo/monte-carlo";

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  box-sizing: border-box;
  top: 35px;
  right: 38px;
  width: 165px;
  height: 190px;
  border-radius: 5px;
  background-color: white;
  border: solid 2px white;
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.35);
`;

const LegendTitleText = styled.div`
  margin: 5px 11px 2px 11px;
  color: #434343;
  font-size: 14px;
  width: 105px;
  height: 20px;
  box-sizing: border-box;
  text-align: center;
`;
const LegendTitleSubText = styled.div`
  margin: 2px 11px 2px 11px;
  color: #434343;
  font-size: 11px;
  width: 120px;
  height: 30px;
  box-sizing: border-box;
  text-align: center;
  font-style: italic;
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

const RiskContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 140px;
  height: 34px;
  margin-top: 5px;
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
`;

interface IProps {
  onClick: any;
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
          width={12}
          height={12}
          fill={"#b7dcad"}
          onClick={onClick}
        >
          <CloseIcon />
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
                  ? <RiskLabel>{`${riskLevel.type} (${riskLevel.min}-${riskLevel.max}%)`}</RiskLabel>
                  : <RiskLabel>{riskLevel.type}</RiskLabel>
                }
              </RiskContainer>
            );
        })}
      </LegendContainer>
    );
  }

}
