import * as React from "react";
import { ICanvasShape, Ipoint } from "../interfaces";
import { CityType  } from "../stores/simulation-store";
import styled from "styled-components";
import { Stage, Sprite } from "@inlet/react-pixi";
import { PixiCityContainer } from "./pixi-city-container";
import { PixiTephraMap } from "./pixi-tephra-map";
import { PixiAxis } from "./pixi-axis";
import { PixiGrid } from "./pixi-grid";
import VolcanoEmitter from "./pixi-volcano-emitter";
import * as AshConfig from "../assets/particles/ash.json";

import * as Color from "color";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";
import { getSnapshot, IStateTreeNode } from "mobx-state-tree";
import { EmitterConfig } from "pixi-particles";

const CanvDiv = styled.div`
  border: 0px solid black; border-radius: 0px;
`;

interface IState {}
interface IProps extends IBaseProps {
  numRows: number;
  numCols: number;
  width: number;
  height: number;
  windSpeed: number;
  windDirection: number;
  mass: number;
  colHeight: number;
  particleSize: number;
  volcanoX: number;
  volcanoY: number;
  gridColors: IStateTreeNode<any, string[]>;
  cities: CityType[];
  map: string;
  isErupting: boolean;
}

@inject("stores")
@observer
export class MapComponent extends BaseComponent<IProps, IState>{

  private ref = React.createRef<HTMLDivElement>();
  private metrics: ICanvasShape;

  public componentDidMount() {
    this.recomputeMetrics();
  }

  public componentDidUpdate(prevProps: IProps) {
    this.recomputeMetrics();
  }

  public render() {
    if (! this.metrics) { this.recomputeMetrics(); }
    const {
      cities,
      volcanoX,
      volcanoY,
      gridColors,
      windDirection,
      windSpeed,
      mass,
      map,
      isErupting
    } = this.props;
    const {width, height, gridSize} = this.metrics;

    const cityItems = cities.map( (city) => {
      const {x, y, name, id} = city;
      if (x && y && name) {
        return <PixiCityContainer gridSize={gridSize} key={id} position={this.toCanvasCoords({x, y})} name={name} />;
      }
    });

    const volcanoPos = this.toCanvasCoords({x: volcanoX, y: volcanoY}, gridSize);

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
          <Sprite image={map} x={0} y={0} width={width} height={height} />
          <PixiTephraMap
            canvasMetrics={this.metrics}
            gridColors={getSnapshot(gridColors)}
            toCanvasCoords={this.toCanvasCoords} />
          {cityItems}
          <PixiAxis gridMetrics={this.metrics} toCanvasCoords={this.toCanvasCoords} />
          <PixiGrid gridMetrics={this.metrics} />
          <Sprite image={"./assets/volcano.png"}
            x={volcanoPos.x - 10}
            y={volcanoPos.y - 10}
            width={60}
            height={60} />
          <VolcanoEmitter
            config={AshConfig.config as unknown as EmitterConfig}
            imagePath={AshConfig.image}
            x={volcanoPos.x + 20}
            y={volcanoPos.y + 20}
            windDirection={windDirection}
            windSpeed={windSpeed}
            mass={mass}
            playing={isErupting} />
        </Stage>
      </CanvDiv>
    );
  }

  public toCanvasCoords = (point: Ipoint, scale = 1): Ipoint => {
    return {x: point.x * scale, y: (this.props.numRows - point.y - 1) * scale};
  }

  private recomputeMetrics() {
    const {numCols, numRows, width, height } = this.props;
    const gridSize = Math.round(width / numCols);
    this.metrics  = {
      gridSize,
      height,
      width,
      numCols,
      numRows
    };
  }
}
