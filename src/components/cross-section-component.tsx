import * as React from "react";
import { ICanvasShape } from "../interfaces";
import styled from "styled-components";
import { Stage } from "@inlet/react-pixi";
import { PixiTephraCrossSection } from "./pixi-tephra-cross-section";
import * as Color from "color";
import { inject, observer } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";
const CanvDiv = styled.div`
  border: 0px solid black; border-radius: 0px;
`;

const ContainerDiv = styled.div`
  width: flex;
  height: flex;
`;

interface IState {}

interface IProps extends IBaseProps {
  height: number;
  width: number;
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
    const {
      height
    } = this.props;

    const {
      volcanoLat,
      volcanoLng,
      crossPoint1Lat,
      crossPoint1Lng,
      crossPoint2Lat,
      crossPoint2Lng,
      hasErupted,
      windSpeed,
      windDirection,
      colHeight,
      mass,
      isSelectingCrossSection
    } = this.stores.simulation;

    const { width } = this.metrics;

    return (
      <CanvDiv ref={this.ref}>
        {hasErupted && <ContainerDiv>
          {isSelectingCrossSection &&
          <ContainerDiv data-test="tephra-thickness-cross-section-container">
            <Stage
              width={width}
              height={height}
              options={{backgroundColor: Color("hsl(0, 10%, 95%)").rgbNumber()}} >
              <PixiTephraCrossSection
                canvasMetrics={this.metrics}
                volcanoLat={volcanoLat}
                volcanoLng={volcanoLng}
                crossPoint1Lat={crossPoint1Lat}
                crossPoint1Lng={crossPoint1Lng}
                crossPoint2Lat={crossPoint2Lat}
                crossPoint2Lng={crossPoint2Lng}
                windSpeed={windSpeed}
                windDirection={windDirection}
                colHeight={colHeight}
                mass={mass} />
            </Stage>
          </ContainerDiv>}
        </ContainerDiv>}
      </CanvDiv>
    );
  }

  private recomputeMetrics() {
    const {width, height } = this.props;
    const gridSize = 0;
    const numCols = 0;
    const numRows = 0;
    this.metrics  = {
      gridSize,
      height,
      width,
      numCols,
      numRows
    };
  }
}
