import * as React from "react";
import { PureComponent } from "react";
import CloseIcon from "../../assets/map-icons/close.svg";
import { LegendContainer, LegendTitleText, AbsoluteIcon,
  TephraContainer, TephraBox, TephraLabel } from "./map-tephra-legend";
import { ColorMethod } from "../../stores/seismic-simulation-store";

// actual data ranges from 0 to 127000, but with only 4 values above 160
const MIN_STRAIN = 0;
const MAX_STRAIN = 140;

const MIN_LOG_STRAIN = Math.log10(0.00001);
const MAX_LOG_STRAIN = Math.log10(1000);

const buckets = 7;

export interface StrainRange {
  color: string;
  min: number;
  max: number | undefined;
}
const colors = ["#EEE270", "#FFBF4E", "#FF754B", "#E94E83", "#AE4ED3", "#7B58AE", "#515A94"];

const stepSize = (MAX_STRAIN - MIN_STRAIN) / buckets;
const logStepSize = (MAX_LOG_STRAIN - MIN_LOG_STRAIN) / buckets;

export const equalIntervalStrainRanges: StrainRange[] = [];
export const logarithmicStrainRanges: StrainRange[] = [];

for (let i = 0; i < buckets; i++) {
  equalIntervalStrainRanges.push({
    color: colors[i],
    min: MIN_STRAIN + (stepSize * i),
    max: (i < buckets - 1) ? MIN_STRAIN + (stepSize * (i + 1)) : undefined
  });
  logarithmicStrainRanges.push({
    color: colors[i],
    min: MIN_LOG_STRAIN + (logStepSize * i),
    max: (i < buckets - 1) ? MIN_LOG_STRAIN + (logStepSize * (i + 1)) : undefined
  });
}

interface IProps {
  onClick: any;
  colorMethod: ColorMethod;
}

interface IState {}

export default class StrainLegendComponent extends PureComponent<IProps, IState> {
  public static defaultProps = {
    onClick: undefined,
  };

  public render() {
    const { onClick, colorMethod } = this.props;
    const isLog = colorMethod === "logarithmic";
    const ranges = isLog ? logarithmicStrainRanges : equalIntervalStrainRanges;
    const round = (val: number) => isLog ? Math.pow(10, val).toFixed(2) : Math.round(val);
    return (
      <LegendContainer>
        <LegendTitleText>Strain rate{isLog ? " (log)" : ""}</LegendTitleText>
        <AbsoluteIcon
          width={12}
          height={12}
          fill={"#b7dcad"}
          onClick={onClick}
        >
          <CloseIcon />
        </AbsoluteIcon>
        {ranges.map((range, index) => {
            return (
              <TephraContainer key={index} data-test="tephra-key">
                <TephraBox backgroundColor={range.color}/>
                { range.max
                  ? <TephraLabel>{` ${round(range.min)}—${round(range.max)}`}</TephraLabel>
                  : <TephraLabel>{` >${round(range.min)}`}</TephraLabel>
                }
              </TephraContainer>
            );
        })}

      </LegendContainer>
    );
  }

}