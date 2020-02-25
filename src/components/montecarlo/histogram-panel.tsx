import * as React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { BaseComponent, IBaseProps } from "../base";
import { HorizontalContainer, VerticalContainer } from "../styled-containers";
import { SvgD3HistogramChart } from "../charts/svg-d3-histogram-chart";
import { ChartType } from "../../stores/charts-store";

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
  bars: boolean;
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
      bars: false,
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
    const {width, height} = this.props;
    const { data } = chart;
    const fakeData: any[] = data.map(d => d[1]);
    const threshold = 201;
    let above = 0;
    fakeData.forEach(d => {
      if (d > threshold) {
        above++;
      }
    });
    const below = fakeData.length - above;
    const abovePercent = Math.round(above / fakeData.length * 100);
    const belowPercent = 100 - abovePercent;

    return (
      <HorizontalContainer>
        <SvgD3HistogramChart
          width={width - 200}
          height={height - 10}
          chart={chart}
          bars={this.state.bars}
        />
        <VerticalContainer>
          <PanelStat>Threshold = 201mm</PanelStat>
          <PanelStat>{`Count below threshold: ${below} (${belowPercent}%)`}</PanelStat>
          <PanelStat>{`Count above threshold: ${above} (${abovePercent}%)`}</PanelStat>
          <PanelStat>Risk: Medium</PanelStat>
          <button onClick={this.changeDisplayType}>Change display type</button>
        </VerticalContainer>
      </HorizontalContainer>
    );
  }

  private changeDisplayType = () => {
    this.setState(prevState => ({
      bars: !prevState.bars
    }));
  }

  private addHistogram = () => {
      const numPoints = 300;

      const title = "Chart " + (this.stores.chartsStore.charts.length + 1);

      const data: number[][] = [];
      for (let i = 0; i < numPoints; i++) {
        data.push([Date.now(), Math.floor(this.randomG(3) * 401)]);
        // data.push([Date.now(), Math.floor(Math.random() * 401)]);
      }

      const xAxisLabel = "Tephra Thickness (mm)";
      const yAxisLabel = "Number of Runs";
      const dateLabelFormat = "%b";
      this.stores.chartsStore.addChart({type: "histogram", data, title, xAxisLabel, yAxisLabel, dateLabelFormat});
  }

  private randomG = (v: number) => {
    let r = 0;
    for (let i = v; i > 0; i--) {
        r += Math.random();
    }
    return r / v;
  }
}
