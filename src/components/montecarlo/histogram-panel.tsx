import * as React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { BaseComponent, IBaseProps } from "../base";
import { HorizontalContainer, VerticalContainer } from "../styled-containers";
import { SvgD3HistogramChart } from "../charts/svg-d3-histogram-chart";
import { ChartType } from "../../stores/charts-store";

// TODO threshold and histogram min/max will need to be set elsewhere
const kTephaThreshold = 201;
const kTephaMin = 0;
const kTephaMax = 400;

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
const PanelStat = styled.div`
  margin: 5px;
  font-size: 14px;
`;

interface IState {
  showBars: boolean; // TODO: remove once we decide on plot style
}

interface IProps extends IBaseProps {
  height: number;
  width: number;
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
    const {width, height} = this.props;
    const histogramChart = this.stores.chartsStore.charts.find(chart => chart.type === "histogram");

    return (
      <Panel height={height} width={width}>
        { histogramChart
          ? this.renderHistogram(histogramChart)
          : <button onClick={this.addHistogram}>Add histogram</button>
        }
      </Panel>
    );
  }

  private renderHistogram = (chart: ChartType) => {
    const { width, height } = this.props;
    const { data } = chart;

    const threshold = kTephaThreshold;
    let above = 0;
    data.forEach((d: number) => {
      if (d > threshold) {
        above++;
      }
    });
    const below = data.length - above;
    const abovePercent = Math.round(above / data.length * 100);
    const belowPercent = 100 - abovePercent;

    return (
      <HorizontalContainer>
        <SvgD3HistogramChart
          width={width - 200}
          height={height - 10}
          chart={chart}
          chartMin={kTephaMin}
          chartMax={kTephaMax}
          showBars={this.state.showBars}
        />
        <VerticalContainer>
          <PanelStat>{`Threshold = ${threshold}mm`}</PanelStat>
          <PanelStat>{`Count below threshold: ${below} (${belowPercent}%)`}</PanelStat>
          <PanelStat>{`Count above threshold: ${above} (${abovePercent}%)`}</PanelStat>
          <PanelStat>{`Risk: ${this.calculateRisk(abovePercent)}`}</PanelStat>
          <button onClick={this.changeDisplayType}>Toggle display</button>
        </VerticalContainer>
      </HorizontalContainer>
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
        data.push(Math.floor(this.randomG(3) * (kTephaMax + 1)));
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
