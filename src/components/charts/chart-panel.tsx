import * as React from "react";
import { IPoint, CanvasD3ScatterChart } from "./canvas-d3-scatter-chart";
import { IVector, CanvasD3RadialChart } from "./canvas-d3-radial-chart";
import styled from "styled-components";
import { SvgD3ScatterChart } from "./svg-d3-scatter-chart";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";

interface IProps {
  width: number;
}

interface Chart { type: "scatter" | "radial"; points: IPoint[] | IVector[]; }
interface IState {
  charts: Chart[];
}

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
  public state: IState = {
    charts: []
  };

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
              this.state.charts.map((chart, i) =>
                <Row key={"row" + i}>
                  {
                    chart.type === "scatter" ?
                      <CanvasD3ScatterChart
                        width={this.props.width * 0.8}
                        height={this.props.width * 0.4}
                        data={chart.points as IPoint[]}
                        xAxisLabel="X Axis"
                        yAxisLabel="Y Axis"
                      /> :
                      <CanvasD3RadialChart
                        width={this.props.width * 0.5}
                        data={chart.points as IVector[]}
                      />
                  }
                </Row>
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
      const points: IPoint[] | IVector[] = [];
      for (let i = 0; i < numPoints; i++) {
        const point = type === "scatter" ?
          {x: Math.random() * max, y: Math.random() * max} :
          {deg: Math.random() * 360, magnitude: Math.random() * max};
        points.push(point as any);
      }
      const charts = this.state.charts;
      charts.push({type, points});
      this.setState({charts});
    };
  }
}
