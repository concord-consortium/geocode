import * as React from "react";
import styled from "styled-components";
import { BaseComponent, IBaseProps } from "./base";
import { Stage, Text } from "@inlet/react-pixi";
import { WindWidget } from "./pixi-wind-widget";
import { ColumnHeightWidget } from "./pixi-column-height-widget";
import { SidebarDataDisplay } from "./pixi-sidebar-data-display";
import { ParticleSizeWidget } from "./pixi-particle-size-widget";
import * as Color from "color";
import { observer, inject } from "mobx-react";

const CanvDiv = styled.div`
  border: 0px solid black; border-radius: 0px;
  margin: 1em;
`;

const style = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 12,
});

interface IState {}
interface IProps extends IBaseProps {
  width: number;
  height: number;
  windSpeed: number;
  windDirection: number;
  colHeight: number;
  vei: number;
  mass: number;
  particleSize: number;
}
interface ISidebarMetrics {
  width: number;
  height: number;
}

@inject("stores")
@observer
export class MapSidebarComponent extends BaseComponent <IProps, IState> {

    private ref = React.createRef<HTMLDivElement>();
    private metrics: ISidebarMetrics;

    public componentDidMount() {
      this.recomputeMetrics();
    }

    public componentDidUpdate(prevProps: IProps) {
      this.recomputeMetrics();
    }

    public render() {

        if (! this.metrics) { this.recomputeMetrics(); }
        const {
            windDirection,
            windSpeed,
            colHeight,
            vei,
            mass,
            particleSize
        } = this.props;
        const {width, height} = this.metrics;

        return (
        <CanvDiv ref={this.ref}>
            <Stage
              width={width}
              height={height}
              options={
                {
                  backgroundColor: Color("hsl(0, 10%, 95%)").rgbNumber(),
                  antialias: true
                }
              } >
                <Text
                  x={70}
                  y={15}
                  style={style}
                  anchor={(0.5)}
                  text="Wind Speed/Direction" />
                <WindWidget
                  windDirection={windDirection}
                  windSpeed={windSpeed}
                  location={{x: 70, y: 60}}
                />
                <Text
                  x={180}
                  y={15}
                  style={style}
                  anchor={(0.5)}
                  text="Column Height"
                />
                <ColumnHeightWidget
                  colHeight={colHeight}
                  location={{x: 190, y: 90}}
                />
                <Text
                  x={275}
                  y={15}
                  style={style}
                  anchor={(0.5)}
                  text="Particle Size"
                />
                <ParticleSizeWidget
                  particleSize={particleSize}
                  location={{x: 275, y: 60}}
                />
                <SidebarDataDisplay
                  vei={vei}
                  colHeight={colHeight}
                  mass={mass}
                  particleSize={particleSize}
                  location={{x: 350, y: 10}}
                />
            </Stage>
        </CanvDiv>);
    }

    private recomputeMetrics() {
      const {width, height} = this.props;
      this.metrics  = {
        height,
        width,
      };
    }
}
