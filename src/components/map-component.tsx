import * as React from "react";
import { ICanvasShape, Ipoint } from "../interfaces";
import { CityType  } from "../stores/simulation-store";
import styled from "styled-components";
import { Stage, Sprite } from "@inlet/react-pixi";
import { PixiCityContainer } from "./pixi-city-container";
import { PixiTephraMap } from "./pixi-tephra-map";
import { PixiAxis } from "./pixi-axis";
import { PixiGrid } from "./pixi-grid";
import { WindWidget } from "./pixi-wind-widget";
import Volcano from "./pixi-volcano";

import * as Color from "color";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";
import { getSnapshot, IStateTreeNode } from "mobx-state-tree";

const CanvDiv = styled.div`
  border: 0px solid black; border-radius: 0px;
  margin: 1em;
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
	  map
    } = this.props;
    const {width, height, gridSize} = this.metrics;

    const cityItems = cities.map( (city) => {
      const {x, y, name, id} = city;
      if (x && y && name) {
        return <PixiCityContainer gridSize={gridSize} key={id} position={this.toCanvasCoords({x, y})} name={name} />;
      }
    });

    return (
      <CanvDiv ref={this.ref}>
        <Stage
          width={width}
          height={height}
          options={{backgroundColor: Color("hsl(0, 10%, 95%)").rgbNumber()}} >
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
          <Volcano gridSize={gridSize} position={this.toCanvasCoords({x: volcanoX, y: volcanoY})} />
          <WindWidget windDirection={windDirection} windSpeed={windSpeed} location={{x: 50, y: 50}}/>
        </Stage>
      </CanvDiv>
    );
  }

  public toCanvasCoords = (point: Ipoint): Ipoint => {
    return {x: point.x, y: this.props.numRows - point.y - 1};
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
