import * as React from "react";
import { CanvasD3ScatterChart } from "./canvas-d3-scatter-chart";
import { CanvasD3RadialChart } from "./canvas-d3-radial-chart";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";

interface IProps {
  width: number;
}
interface IState {}

const Background = styled.div`
  position: fixed;
  width: ${(p: {width: number}) => `${p.width}px`};
  margin: 10px 4px;
  color: #555;
`;

const Scroll = styled.div`
  width: 90%;
  height: 90vh;
  overflow-y: scroll;
  background-color: #EEE;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

@inject("stores")
@observer
export class ChartPanel extends BaseComponent<IProps, IState> {

  private lastScrollEl = React.createRef<HTMLDivElement>();

  public render() {
    return (
      <Background width={this.props.width}>
        {
          this.stores.uiStore.showDemoCharts &&
          <React.Fragment>
            <Row>Add demo chart:</Row>
            <Row>
              <button onClick={this.addDemoChart("scatter", 0)}>Tiny scatter</button>
              <button onClick={this.addDemoChart("scatter", 1)}>Medium scatter</button>
              <button onClick={this.addDemoChart("scatter", 2)}>Large scatter</button>
              <button onClick={this.addDemoChart("radial", 0)}>Tiny radial</button>
              <button onClick={this.addDemoChart("radial", 1)}>Medium radial</button>
              <button onClick={this.addDemoChart("radial", 2)}>Large radial</button>
            </Row>
          </React.Fragment>
        }
        <Row>
          <Scroll>
            {
              this.stores.chartsStore.charts.map((chart, i) =>
                <div key={"row" + i}>
                  {
                    chart.title &&
                    <Row><strong>{chart.title}</strong></Row>
                  }
                  <Row>
                    {
                      chart.type === "scatter" ?
                        <CanvasD3ScatterChart
                          width={this.props.width * 0.8}
                          height={this.props.width * 0.4}
                          data={chart.data}
                          xAxisLabel={chart.xAxisLabel}
                          yAxisLabel={chart.yAxisLabel}
                        /> :
                        <CanvasD3RadialChart
                          width={this.props.width * 0.5}
                          data={chart.data}
                        />
                    }
                  </Row>
                </div>
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

  private addDemoChart = (type: "scatter" | "radial", size: 0 | 1 | 2) => {
    return () => {
      const numPoints = size === 0 ? 100 : size === 1 ? 1600 : 16000;
      const max = Math.random() * 1000;
      const points: number[][] = [];
      for (let i = 0; i < numPoints; i++) {
        type === "scatter" ?
          points.push([Math.random() * max, Math.random() * max]) :
          points.push([Math.random() * 360, Math.random() * max]);
      }

      const title = "Chart " + (this.stores.chartsStore.charts.length + 1);
      if (type === "scatter") {
        this.stores.chartsStore.addChart(type, points, title, "Some X Axis", "Some Y Axis");
      } else {
        this.stores.chartsStore.addChart(type, points, title);
      }
    };
  }
}
