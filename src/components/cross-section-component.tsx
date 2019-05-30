import * as React from "react";
import { ICanvasShape } from "../interfaces";
import { SimDatumType, CityType  } from "../stores/simulation-store";
import styled from "styled-components";
import { Stage, Text } from "@inlet/react-pixi";
import { PixiTephraCrossSection } from "./pixi-tephra-cross-section";
import * as Color from "color";
import { inject, observer } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";

const CanvDiv = styled.div`
  border: 0px solid black; border-radius: 0px;
`;

interface IState {}
interface IProps extends IBaseProps {
  numRows: number;
  numCols: number;
  height: number;
  width: number;
  volcanoX: number;
  data: SimDatumType[];
  // cities: CityType[];
}

@inject("stores")
@observer
export class CrossSectionComponent extends BaseComponent<IProps, IState>{

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
    const { volcanoX, data, height } = this.props;
    const { width, gridSize } = this.metrics;

    return (
      <CanvDiv ref={this.ref}>
        <Stage
          width={width}
          height={height}
          options={{backgroundColor: Color("hsl(0, 10%, 95%)").rgbNumber()}} >
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
