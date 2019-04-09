import * as React from "react";
import { ICanvasShape } from "../interfaces";
import { SimDatumType, CityType  } from "../stores/volcano-store";
import styled from "styled-components";
import { Stage, Text } from "@inlet/react-pixi";
import { PixiTephraCrossSection } from "./pixi-tephra-cross-section";
import * as Color from "color";

const CanvDiv = styled.div`
  border: 0px solid black; border-radius: 0px;
  margin: 1em;
`;

interface IState {}
interface IProps {
  numRows: number;
  numCols: number;
  height: number;
  width: number;
  volcanoX: number;
  data: SimDatumType[];
  // cities: CityType[];
}

export class CrossSectionComponent extends React.Component<IProps, IState>{

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
    const { volcanoX, data, height } = this.props;
    const { width, gridSize } = this.metrics;

    return (
      <CanvDiv ref={this.ref}>
        <Stage
          width={width}
          height={height}
          options={{backgroundColor: Color("hsl(0, 30%, 95%)").rgbNumber()}} >
          <PixiTephraCrossSection
            canvasMetrics={this.metrics}
            data={data.map( (d) => d.thickness )} />
        </Stage>
      </CanvDiv>
    );
  }

  private recomputeMetrics() {
    const {numCols, numRows, width, height } = this.props;
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
