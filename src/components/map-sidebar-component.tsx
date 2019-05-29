import * as React from "react";

import { ICanvasShape} from "../interfaces";
import styled from "styled-components";
import { BaseComponent, IBaseProps } from "./base";
import { Stage } from "@inlet/react-pixi";
import { WindWidget } from "./pixi-wind-widget";
import * as Color from "color";

const CanvDiv = styled.div`
  border: 0px solid black; border-radius: 0px;
  margin: 1em;
`;

interface IState {}
interface IProps extends IBaseProps {
  width: number;
  height: number;
  windSpeed: number;
  windDirection: number;
}
interface ISidebarMetrics {
  width: number;
  height: number;
}

export class MapSidebarComponent extends BaseComponent <IProps, IState> {

    private ref = React.createRef<HTMLDivElement>();
    private metrics: ISidebarMetrics;

    public render() {

        if (! this.metrics) { this.recomputeMetrics(); }
        const {
            windDirection,
            windSpeed,
        } = this.props;
        const {width, height} = this.metrics;

        return (<CanvDiv ref={this.ref}>
            <Stage
            width={width}
            height={height}
            options={
              {
                backgroundColor: Color("hsl(0, 10%, 95%)").rgbNumber(),
                antialias: true
              }
            } >

                <WindWidget windDirection={windDirection} windSpeed={windSpeed} location={{x: 50, y: 50}}/>
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