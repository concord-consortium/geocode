import * as React from "react";
import { CanvasVolcano } from "../canvas-volcano";
import { CanvasCities } from "../canvas-cities";
import { ICanvasShape } from "../canvas-grid";
import { SimDatumType, CityType } from "../stores/volcano-store";
import RunCalculation from "../volcano-simulator";
import styled from "styled-components";

const CanvDiv = styled.div`
  border: 2px solid black; border-radius: 10px;
`;

interface IState {}
interface IProps {
  numRows: number;
  numColumns: number;
  windSpeed: number;
  windDirection: number;
  mass: number;
  colHeight: number;
  particleSize: number;
  data: SimDatumType[];
  cities: CityType[];
}

export class VolcanoComponent extends React.Component<IProps, IState>{

  private canvRef = React.createRef<HTMLCanvasElement>();
  private volcano: CanvasVolcano | null = null;
  private cityLayer: CanvasCities | null = null;

  public componentDidUpdate(prevProps: IProps) {
    const canvas = this.canvRef.current;
    if (canvas) {
      const gridSize = canvas.width / this.props.numRows;
      // const data: SimDatumType[] = RunCalculation(20, 20);
      const {data, cities} = this.props;
      const canv = this.canvRef.current as HTMLCanvasElement;
      const ctx = canv.getContext("2d") as CanvasRenderingContext2D;
      const metrics: ICanvasShape  = {
        gridSize,
        height: canvas.height,
        width: canvas.width,
        numCols: this.props.numColumns,
        numRows: this.props.numRows
      };
      this.volcano = new CanvasVolcano(ctx, metrics, data);
      this.cityLayer = new CanvasCities(ctx, metrics, cities);
      this.volcano.draw();
      this.cityLayer.draw();
    }

  }

  public render() {
    return (
      <CanvDiv>
        <canvas ref={this.canvRef} width={500} height={500}/>
      </CanvDiv>
    );
  }
}
