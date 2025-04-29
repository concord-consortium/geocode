import { PureComponent } from "react";
import styled from "styled-components";
import CloseIcon from "../../assets/map-icons/close.svg";
import { LegendContainer, AbsoluteIcon, TephraContainer, TephraBox, TephraLabel } from "./map-tephra-legend";
import { ColorMethod } from "../../stores/seismic-simulation-store";

// actual data ranges from 0 to 127000, but with only 4 values above 160
const MIN_STRAIN = 0;
const MAX_STRAIN = 175;

// const MIN_LOG_STRAIN = Math.log10(0.00001);
// const MAX_LOG_STRAIN = Math.log10(1000);

const buckets = 7;

export const LegendTitleText = styled.div`
  margin: 5px 11px 2px 5px;
  color: #434343;
  font-size: 14px;
  font-weight: normal;
  width: 80px;
  height: 34px;
  box-sizing: border-box;
  text-align: center;
`;

export interface DeformationRange {
  color: string;
  min: number;
  max: number | undefined;
}
const colors = ["#EEE270", "#FFBF4E", "#FF754B", "#E94E83", "#AE4ED3", "#7B58AE", "#515A94"];

const stepSize = (MAX_STRAIN - MIN_STRAIN) / buckets;
// const logStepSize = (MAX_LOG_STRAIN - MIN_LOG_STRAIN) / buckets;

export const equalIntervalDeformationRanges: DeformationRange[] = [];

for (let i = 0; i < buckets; i++) {
  equalIntervalDeformationRanges.push({
    color: colors[i],
    min: MIN_STRAIN + (stepSize * i),
    max: (i < buckets - 1) ? MIN_STRAIN + (stepSize * (i + 1)) : undefined
  });
}

export const logarithmicDeformationRanges: DeformationRange[] = [
  {
    color: colors[0],
    min: 0,
    max: 4
  },
  {
    color: colors[1],
    min: 4,
    max: 12
  },
  {
    color: colors[2],
    min: 12,
    max: 28
  },
  {
    color: colors[3],
    min: 28,
    max: 60
  },
  {
    color: colors[4],
    min: 60,
    max: 124
  },
  {
    color: colors[5],
    min: 124,
    max: 252
  },
  {
    color: colors[6],
    min: 252,
    max: undefined
  },
];

interface IProps {
  onClick: any;
  colorMethod: ColorMethod;
}

interface IState {}

export default class DeformationLegendComponent extends PureComponent<IProps, IState> {
  public static defaultProps = {
    onClick: undefined,
  };

  public render() {
    const { onClick, colorMethod } = this.props;
    const isLog = colorMethod === "logarithmic";
    const ranges = isLog ? logarithmicDeformationRanges : equalIntervalDeformationRanges;
    const round = (val: number) => Math.round(val);
    return (
      <LegendContainer>
        <LegendTitleText>Deformation<br/>build-up (s<sup>-1</sup>)</LegendTitleText>
        <AbsoluteIcon
          width={28}
          height={28}
          fill={"#b7dcad"}
          onClick={onClick}
        >
          <CloseIcon width={12} height={12} />
        </AbsoluteIcon>
        {ranges.map((range, index) => {
            return (
              <TephraContainer key={index} data-test="tephra-key">
                <TephraBox backgroundColor={range.color}/>
                { range.max
                  ? <TephraLabel>{`- ${round(range.min)}—${round(range.max)}`}</TephraLabel>
                  : <TephraLabel>{`- >${round(range.min)}`}</TephraLabel>
                }
              </TephraContainer>
            );
        })}
      </LegendContainer>
    );
  }
}
