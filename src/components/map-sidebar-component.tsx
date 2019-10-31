import * as React from "react";
import styled from "styled-components";
import { BaseComponent, IBaseProps } from "./base";
import { Stage, Text } from "@inlet/react-pixi";
import { WindWidget } from "./pixi-wind-widget";
import { SidebarDataDisplay } from "./pixi-sidebar-data-display";
import { ParticleSizeWidget } from "./pixi-particle-size-widget";
import * as Color from "color";
import { observer, inject } from "mobx-react";
import VEIWidget from "./vei-widget";
import EjectedVolumeWidget from "./ejected-volume-widget";
import ColumnHeightWidget from "./column-height-widget";
import WindSpeedDirectionWidget from "./wind-speed-direction-widget";
import { WidgetPanelTypes } from "../utilities/widget";

const CanvDiv = styled.div`
  display: flex;
  border: 0px solid black;
  border-radius: 0px;
  margin: 10px 28px 10px 28px;
`;

const style = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 12,
});

interface IState {}
interface IProps extends IBaseProps {
  width: number;
  height: number;
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
        } = this.stores.simulation;
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
            </Stage>
            <WindSpeedDirectionWidget
                type={WidgetPanelTypes.RIGHT}
                showWindDirection={true}
                showWindSpeed={true}
                windDirection={windDirection}
                windSpeed={windSpeed}
            />
            <EjectedVolumeWidget
              type={WidgetPanelTypes.RIGHT}
              volumeInKilometersCubed={mass / Math.pow(10, 12)}
            />
            <ColumnHeightWidget
              type={WidgetPanelTypes.RIGHT}
              columnHeightInKilometers={colHeight / 1000}
            />
            <VEIWidget
              type={WidgetPanelTypes.RIGHT}
              vei={vei}
              mass={mass}
              columnHeight={colHeight}
            />
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
