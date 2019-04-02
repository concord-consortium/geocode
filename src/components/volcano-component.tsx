import * as React from "react";
import { CanvasVolcano } from "../canvas-volcano";
import { ICanvasShape } from "../canvas-grid";
import { SimDatumType } from "../models/volcano-store";
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
}

export class VolcanoComponent extends React.Component<IProps, IState>{

  private canvRef = React.createRef<HTMLCanvasElement>();
  private volcano: CanvasVolcano| null = null;

  public componentDidUpdate(prevProps: IProps) {
    const canvas = this.canvRef.current;
    if (canvas) {
      const gridSize = canvas.width / this.props.numRows;
      // const data: SimDatumType[] = RunCalculation(20, 20);
      const data = this.props.data;
      const metrics: ICanvasShape  = {
        gridSize,
        height: canvas.height,
        width: canvas.width,
        numCols: this.props.numColumns,
        numRows: this.props.numRows
      };
      this.volcano = new CanvasVolcano(this.canvRef.current as HTMLCanvasElement, metrics, data);
      this.volcano.draw();
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
