import * as React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { BaseComponent, IBaseProps } from "../base";
import { HorizontalContainer, VerticalContainer } from "../styled-containers";
import { SvgD3HistogramChart } from "../charts/svg-d3-histogram-chart";
import { ChartType } from "../../stores/charts-store";

// TODO threshold and histogram min/max will need to be set elsewhere
const kTephraThreshold = 201;
const kTephraMin = 0;
const kTephraMax = 400;

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
  percentComplete: number;
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
    let above = 0;
    data && data.forEach((d: number) => {
      if (d > threshold) {
        above++;
      }
    });
    const below = data ? data.length - above : 0;
    const abovePercent = data ? Math.round(above / data.length * 100) : 0;
    const belowPercent = data ? 100 - abovePercent : 0;

    return (
      <Panel height={height} width={width}>
        <HorizontalContainer>
          { histogramChart
            ? this.renderHistogram(histogramChart)
            : <PanelHistogramDiv
                width={width - 200}
                height={height - 10}
              />
          }
          <VerticalContainer>
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
            <PanelStat>{`Threshold = ${threshold} mm`}</PanelStat>
            <PanelStat>{`Count below threshold: ${below} (${belowPercent}%)`}</PanelStat>
            <PanelStat>{`Count above threshold: ${above} (${abovePercent}%)`}</PanelStat>
            <PanelStat>
              {`Risk: ${data && percentComplete === 100 ? this.calculateRisk(abovePercent) : "---"}`}
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

  private renderHistogram = (chart: ChartType) => {
    const { width, height } = this.props;
    return (
      <SvgD3HistogramChart
        width={width - 200}
        height={height - 10}
        chart={chart}
        chartMin={kTephraMin}
        chartMax={kTephraMax}
        showBars={this.state.showBars}
      />
    );
  }

  private calculateRisk = (percent: number) => {
    if (percent > 80) {
      return "High";
    } else if (percent > 31) {
      return "Medium";
    } else {
      return "Low";
    }
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
      for (let i = 0; i < numPoints; i++) {
        data.push(Math.floor(this.randomG(3) * (kTephraMax + 1)));
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
