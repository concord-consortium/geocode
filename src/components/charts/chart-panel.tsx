import * as React from "react";
import { CanvasD3ScatterChart } from "./canvas-d3-scatter-chart";
import { CanvasD3RadialChart } from "./canvas-d3-radial-chart";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";
import { Datasets } from "../../stores/data-sets";
import * as d3 from "d3";
import { SvgD3ScatterChart } from "./svg-d3-scatter-chart";

interface IProps {
  width: number;
}
interface IState {}

const Background = styled.div`
  position: fixed;
  width: ${(p: {width: number}) => `${p.width}px`};
  height: 100%;
  margin: 10px 4px;
  color: #555;
`;

const Scroll = styled.div`
  position: absolute;
  top: 30px;
  width: 95%;
  height: 85vh;
  overflow-y: scroll;
  background-color: ${(p: {backgroundColor: string}) => p.backgroundColor || "#F9F9F9"};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-bottom: 10px;
`;

const Title = styled.span`
  font-weight: 600;
`;

@inject("stores")
@observer
export class ChartPanel extends BaseComponent<IProps, IState> {

  private lastScrollEl = React.createRef<HTMLDivElement>();

  public render() {
    return (
      <Background width={this.props.width}>
        {
          this.stores.uiStore.showDemoCharts ?
          <React.Fragment>
            <Row>
              Add:&nbsp;
              <button onClick={this.addDemoChart("all-time-scatter", 0)}>Speed-time (sm)</button>
              <button onClick={this.addDemoChart("all-time-scatter", 1)}>Speed-time (lg)</button>
              <button onClick={this.addDemoChart("month-scatter", 0)}>Speed-month (sm)</button>
              <button onClick={this.addDemoChart("month-scatter", 1)}>Speed-month (lg)</button>
              <button onClick={this.addDemoChart("radial-arrows", 0)}>Radial (sm)</button>
              <button onClick={this.addDemoChart("radial-arrows", 1)}>Radial (lg)</button>
              <button onClick={this.addDemoChart("radial-dots", 0)}>Radial dots (sm)</button>
              <button onClick={this.addDemoChart("radial-dots", 1)}>Radial dots (lg)</button>
            </Row>
          </React.Fragment> :
          <Row><Title>Data Charts</Title></Row>
        }
        <Row>
          <Scroll backgroundColor={this.stores.unit.name === "Seismic" ? "white" : "#F9F9F9"}>
            {
              this.stores.chartsStore.charts.map((chart, i) =>
                chart.type !== "histogram" ?
                <div key={"row" + i}>
                  {
                    chart.title &&
                    <Row><strong><u>{chart.title}</u></strong></Row>
                  }
                  <Row data-test={"data-chart-" + chart.type}>
                    {
                      chart.type === "radial" ?
                        <CanvasD3RadialChart
                          width={this.props.width * 0.6}
                          chart={chart}
                        /> :
                        chart.data.length < 5000 ?
                        <SvgD3ScatterChart
                          width={this.props.width * 0.85}
                          height={this.props.width * 0.45}
                          chart={chart}
                        /> :
                        <CanvasD3ScatterChart
                          width={this.props.width * 0.85}
                          height={this.props.width * 0.45}
                          chart={chart}
                        />
                    }
                  </Row>
                </div>
                : null
              )
            }
            <Row ref={this.lastScrollEl} />
          </Scroll>
        </Row>
      </Background>
    );
  }

  public componentDidUpdate() {
    if (this.lastScrollEl && this.lastScrollEl.current) {
      this.lastScrollEl.current.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
    }
  }

  private addDemoChart = (type: "all-time-scatter" | "month-scatter" | "radial-arrows" | "radial-dots", size: 0|1) => {
    return () => {
      const allData = Datasets.getAllData("Wind Data");
      const numPoints = size === 0 ? 500 : 16000;
      const sample = numPoints === 16000 ?
        allData :
        Datasets.getRandomSampleWithReplacement(allData, numPoints);

      const title = "Chart " + (this.stores.chartsStore.charts.length + 1);

      const data: number[][] = [];

      if (type === "all-time-scatter") {
        const dateParser = d3.timeParse("%Y-%m-%d");
        for (let i = 0; i < numPoints; i++) {
          const dateStr = sample[i].year + "-" + sample[i].month + "-" + sample[i].day;
          const date = dateParser(dateStr)!;
          data.push([date, sample[i].speed]);
        }
        const xAxisLabel = "Date";
        const yAxisLabel = "Wind speed";
        const dateLabelFormat = "%b %Y";
        this.stores.chartsStore.addChart({type: "scatter", data, title, xAxisLabel, yAxisLabel, dateLabelFormat});
      } else if (type === "month-scatter") {
        const dateParser = d3.timeParse("%m");
        for (let i = 0; i < numPoints; i++) {
          const date = dateParser(sample[i].month)!;
          data.push([date, sample[i].speed]);
        }
        const xAxisLabel = "Month";
        const yAxisLabel = "Wind speed";
        const dateLabelFormat = "%b";
        this.stores.chartsStore.addChart({type: "scatter", data, title, xAxisLabel, yAxisLabel, dateLabelFormat});
      } else {
        for (let i = 0; i < numPoints; i++) {
          data.push([sample[i].direction, sample[i].speed]);
        }
        const chartStyle = type === "radial-dots" ? "dot" : "arrow";
        const customExtents = [[], [0, 23]];
        this.stores.chartsStore.addChart({type: "radial", data, customExtents, title, chartStyle});
      }
    };
  }
}
