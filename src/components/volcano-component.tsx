import * as React from "react";
import { CanvasVolcano } from "../canvas-volcano";
import { CanvasCities } from "../canvas-cities";
import { ICanvasShape } from "../canvas-grid";
import { SimDatumType, CityType, City } from "../stores/volcano-store";
import styled from "styled-components";
import { Stage, Text } from "@inlet/react-pixi";
import { TextStyle } from "pixi.js";
import { PixiCityContainer } from "./pixi-city-container";
import Volcano from "./pixi-volcano";

import * as Color from "color";

const CanvDiv = styled.div`
  border: 2px solid black; border-radius: 10px;
`;

interface IState {}
interface IProps {
  numRows: number;
  numCols: number;
  windSpeed: number;
  windDirection: number;
  mass: number;
  colHeight: number;
  particleSize: number;
  volcanoX: number;
  volcanoY: number;
  data: SimDatumType[];
  cities: CityType[];
}

const BasicText = () => {
  const style = new TextStyle({fill: "black", fontSize: "12px"});
  return (
    <Text style={style} x={30} y={90} text="Basic text in pixi" />
  );
};

export class VolcanoComponent extends React.Component<IProps, IState>{

  private ref = React.createRef<HTMLDivElement>();
  private metrics: ICanvasShape;

  public componentDidMount() {
    this.recomputeMetrics();
  }

  public componentDidUpdate(prevProps: IProps) {
    this.recomputeMetrics();
  }

  public render() {
    if (! this.metrics) { return null; }
    const {cities, volcanoX, volcanoY} = this.props;
    const {width, height, gridSize} = this.metrics;
    const cityItems = cities.map( (city) => {
      const {x, y, name, id} = city;
      if (x && y && name) {
        return <PixiCityContainer gridSize={gridSize} key={id} position={{x, y}} name={name} />;
      }
    });

    return (
      <CanvDiv ref={this.ref}>
        <Stage
          width={width}
          height={height}
          options={{backgroundColor: Color("hsl(0, 30%, 95%)").rgbNumber()}} >
          {cityItems}
          <Volcano gridSize={gridSize} gridX={volcanoX} gridY={volcanoY} />
        </Stage>
      </CanvDiv>
    );
  }

  private recomputeMetrics() {
    const {numCols, numRows } = this.props;
    const width = 500;
    const height = 500;
    const gridSize = width / numCols;
    this.metrics  = {
      gridSize,
      height,
      width,
      numCols,
      numRows
    };
  }
}
