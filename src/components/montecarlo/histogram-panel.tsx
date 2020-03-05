import * as React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { BaseComponent, IBaseProps } from "../base";
import { HorizontalContainer, VerticalContainer } from "../styled-containers";
import { SvgD3HistogramChart } from "../charts/svg-d3-histogram-chart";
import { ChartType } from "../../stores/charts-store";
import { kTephraThreshold, kTephraMin, kTephraMax, ThresholdData,
         calculateThresholdData, calculateRisk } from "./monte-carlo";

interface PanelProps {
  height: number;
  width: number;
}
const Panel = styled.div`
  border: 0px solid black; border-radius: 0px;
  background-color: white;
  height: ${(p: PanelProps) => `${p.height}px`};
  width: ${(p: PanelProps) => `${p.width - 56}px`};
  margin: 10px 28px;
  box-sizing: content-box;
`;
const PanelHistogramDiv = styled.div`
  min-width: ${(p: PanelProps) => `${p.width}px`};
  height: ${(p: PanelProps) => `${p.height}px`};
`;
const PanelStat = styled.div`
  margin: 5px;
  font-size: 14px;
`;
const PanelPercent = styled.div`
  height: 15px;
  width: 100px;
`;
const PercentBack = styled.div`
  width: 100px;
  height: 10px;
  border: 1px solid #CCD1D7;
  border-radius: 10px;
  position: absolute;
`;
interface PercentProps {
  percent: number;
}
const PercentFront = styled.div`
  width: ${(p: PercentProps) => `${p.percent}px`};
  height: 10px;
  background-color: #0074EB;
  border: 1px solid #93C4F7;
  border-radius: ${(p: PercentProps) => `10px ${p.percent > 97 ? 10 : 0}px ${p.percent > 97 ? 10 : 0}px 10px`};
  position: absolute;
`;

interface IState {
  showBars: boolean; // TODO: remove once we decide on plot style
}

interface IProps extends IBaseProps {
  height: number;
  width: number;
  percentComplete?: number;
}

@inject("stores")
@observer
export class HistogramPanel extends BaseComponent<IProps, IState>{

  constructor(props: IProps) {
    super(props);
    const initialState: IState = {
      showBars: false,
    };
    this.state = initialState;
  }

  public render() {
    const {width, height, percentComplete} = this.props;
    const histogramChart = this.stores.chartsStore.charts.find(chart => chart.type === "histogram");
    const data = histogramChart && histogramChart.data;
    const threshold = kTephraThreshold;
    const thresholdData: ThresholdData = calculateThresholdData(data, threshold);
    const riskLevel = calculateRisk(thresholdData.greaterThanPercent);
    return (
      <Panel height={height} width={width}>
        <HorizontalContainer>
          { histogramChart
            ? this.renderHistogram(histogramChart, threshold)
            : <PanelHistogramDiv
                width={width - 200}
                height={height - 10}
              />
          }
          <VerticalContainer>
            { percentComplete !== undefined &&
              <PanelStat>
                <PanelPercent>
                  <PercentBack/>
                  { percentComplete > 0
                    ? <PercentFront percent={percentComplete}/>
                    : null
                  }
                </PanelPercent>
                {`${percentComplete}% complete`}
              </PanelStat>
            }
            <PanelStat>{`Threshold = ${threshold} mm`}</PanelStat>
            <PanelStat>
              {`Count below threshold: ${thresholdData.lessThanEqual} (${thresholdData.lessThanEqualPercent}%)`}
            </PanelStat>
            <PanelStat>
              {`Count above threshold: ${thresholdData.greaterThan} (${thresholdData.greaterThanPercent}%)`}
            </PanelStat>
            <PanelStat>
              {`Risk: ${data && riskLevel && (!percentComplete || percentComplete === 100)
                        ? riskLevel.level
                        : "---"}`}
            </PanelStat>
            { histogramChart
              ? <button onClick={this.changeDisplayType}>Toggle display</button>
              : <button onClick={this.addHistogram}>Add data</button>
            }
          </VerticalContainer>
        </HorizontalContainer>
      </Panel>
    );
  }

  private renderHistogram = (chart: ChartType, threshold: number) => {
    const { width, height } = this.props;
    return (
      <SvgD3HistogramChart
        width={width - 200}
        height={height - 10}
        chart={chart}
        chartMin={kTephraMin}
        chartMax={kTephraMax}
        showBars={this.state.showBars}
        threshold={threshold}
      />
    );
  }

  // TODO: for testing only, remove once we decide on plot style
  private changeDisplayType = () => {
    this.setState(prevState => ({
      showBars: !prevState.showBars
    }));
  }

  // TODO: for testing only, remove when we have real data
  private addHistogram = () => {
      const numPoints = 300;
      const title = "Chart " + (this.stores.chartsStore.charts.length + 1);
      const data: number[] = [];
      const shift = Math.random();
      for (let i = 0; i < numPoints; i++) {
        let r = this.randomG(3) + shift;
        if (r > 1) r = r - 1;
        data.push(Math.floor(r * (kTephraMax + 1)));
      }
      const xAxisLabel = "Tephra Thickness (mm)";
      const yAxisLabel = "Number of Runs";
      const dateLabelFormat = "%b";
      this.stores.chartsStore.addChart({type: "histogram", data, title, xAxisLabel, yAxisLabel, dateLabelFormat});
  }

  // TODO: for testing only, remove when we have real data
  private randomG = (v: number) => {
    let r = 0;
    for (let i = v; i > 0; i--) {
        r += Math.random();
    }
    return r / v;
  }
}
