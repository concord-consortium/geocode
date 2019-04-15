import * as React from "react";
import { ICanvasShape } from "../interfaces";
import { SimDatumType, CityType  } from "../stores/simulation-store";
import styled from "styled-components";
import { Stage, Text } from "@inlet/react-pixi";
import { PixiCityContainer } from "./pixi-city-container";
import { PixiTephraMap } from "./pixi-tephra-map";
import { PixiAxis } from "./pixi-axis";
import { PixiGrid } from "./pixi-grid";
import Volcano from "./pixi-volcano";

import * as Color from "color";

const CanvDiv = styled.div`
  border: 0px solid black; border-radius: 0px;
  margin: 1em;
`;

interface IState {}
interface IProps {
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
  data: SimDatumType[];
  cities: CityType[];
}

export class MapComponent extends React.Component<IProps, IState>{

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
    const {cities, volcanoX, volcanoY, data} = this.props;
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
          options={{backgroundColor: Color("hsl(0, 10%, 95%)").rgbNumber()}} >
          <PixiTephraMap
            canvasMetrics={this.metrics}
            data={data.map( (d) => d.thickness )} />
          {cityItems}
          <PixiAxis gridMetrics={this.metrics} />
          <PixiGrid gridMetrics={this.metrics} />
          <Volcano gridSize={gridSize} position={{x: volcanoX, y: volcanoY}} />
        </Stage>
      </CanvDiv>
    );
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
