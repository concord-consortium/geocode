import * as React from "react";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";
import { IDisposer, onAction } from "mobx-state-tree";

interface IProps {
  width: number;
  height: number;
}

interface Point {x: number; y: number; }

const canvasMargin = {
  top: 10,
  left: 20
};
let canvasWidth = 0;
let canvasHeight = 0;
const minModelMargin = 20;

const backgroundColor = "#eee";
const drawAreaColor = "#fff";
const textColor = "#333";

const lineSpacing = 35;

@inject("stores")
@observer
export class DeformationModel extends BaseComponent<IProps, {}> {

  private canvasRef = React.createRef<HTMLCanvasElement>();
  private disposer: IDisposer;

  public componentDidMount() {
    this.drawModel();
    this.disposer = onAction(this.stores.seismicSimulation, this.drawModel);
  }

  public componentDidUpdate() {
    this.redraw();
  }

  public render() {
    const { width, height } = this.props;

    canvasWidth = width - (canvasMargin.left * 2);
    canvasHeight = height - (canvasMargin.top * 2);
    const relativeStyle: React.CSSProperties = {position: "relative", width, height};
    const absoluteStyle: React.CSSProperties = {
      position: "absolute", top: canvasMargin.top, left: canvasMargin.left, width: canvasWidth, height: canvasHeight
    };
    return (
      <div style={relativeStyle}>
        <canvas ref={this.canvasRef} style={absoluteStyle} />
      </div>
    );
  }

  private redraw() {
    if (this.canvasRef.current) {
      // clear everything
      const ctx = this.canvasRef.current.getContext("2d")!;
      ctx.clearRect(0, 0, this.props.width, this.props.height);
    }
    this.drawModel();
  }

  private drawModel = () => {
    if (!this.canvasRef.current) return;

    this.canvasRef.current.width = canvasWidth;
    this.canvasRef.current.height = canvasHeight;

    const modelMargin = {
      left: (canvasWidth - this.modelWidth) / 2,
      top: (canvasHeight - this.modelWidth) / 2
    };

    const ctx = this.canvasRef.current.getContext("2d")!;

    // draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // draw border
    ctx.beginPath();
    ctx.rect(modelMargin.left, modelMargin.top, this.modelWidth, this.modelWidth);
    ctx.stroke();
    ctx.fillStyle = drawAreaColor;
    ctx.fill();

    // show fault line
    ctx.beginPath();
    ctx.setLineDash([20, 5]);
    ctx.moveTo(modelMargin.left + (this.modelWidth / 2), modelMargin.top);
    ctx.lineTo(modelMargin.left + (this.modelWidth / 2), this.modelWidth + modelMargin.top);
    ctx.stroke();
    ctx.setLineDash([]);

    // set up the GPS site positions
    const stationPoints = this.generateGPSStationPoints(modelMargin.left, modelMargin.top);
    const startPoint = stationPoints[0];

    // text labels
    // labels must be drawn before we clip the canvas
    ctx.font = "20px Arial";
    ctx.fillStyle = textColor;
    ctx.beginPath();
    for (let i = 0; i < stationPoints.length; i++){
      ctx.textAlign = stationPoints[i].x < this.modelWidth / 2 ? "right" : "left";
      const textPositionAdjust = stationPoints[i].x < this.modelWidth / 2 ? -10 : 10;
      ctx.fillText(`Station ${i}`, stationPoints[i].x + textPositionAdjust, stationPoints[i].y);
    }
    ctx.stroke();

    // Draw lines between stations to form a triangle
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    for (const station of stationPoints){
      ctx.lineTo(station.x, station.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.save();
    // now we stop the deformation lines appearing outside of the area
    ctx.clip();

    // Start deformation lines
    const lines: Point[][] = [];
    // start below model and go beyond in case lines curve into model
    const yBounds = [modelMargin.top - 10, modelMargin.top + this.modelWidth + 20];
    const xBounds = [modelMargin.left - 10, modelMargin.left + this.modelWidth + 20];
    // horizontal point arrays
    for (let y = yBounds[0]; y < yBounds[1]; y += lineSpacing) {
      lines.push(this.generateYDisplacementLine(y, modelMargin.left));
    }
    // vertical lines
    for (let x = xBounds[0]; x < xBounds[1]; x += lineSpacing) {
      lines.push(this.generateXDisplacementLine(x, modelMargin.top));
    }

    const drawBzCurve = this.bzCurve(ctx);
    lines.forEach(drawBzCurve);

    ctx.restore();
    // site markers
    ctx.fillStyle = "#cc7755";
    ctx.strokeStyle = textColor;
    ctx.beginPath();
    for (const station of stationPoints){
      ctx.moveTo(station.x, station.y);
      ctx.arc(station.x, station.y, 5, 0, 2 * Math.PI);
    }
    ctx.stroke();
    ctx.fill();
  }

  private get modelWidth() {
    const smallestDimension = Math.min(canvasWidth, canvasHeight);
    return smallestDimension - (minModelMargin * 2);
  }

  private generateYDisplacementLine(yOrigin: number, xOffset: number) {

    const { deformationModelStep: step, deformationSimulationProgress: progress,
      deformationBlock1Speed, deformationBlock1Direction, deformationBlock2Speed, deformationBlock2Direction } =
      this.stores.seismicSimulation;

    const steps = 300;
    const stepSize = this.modelWidth / steps;

    const points: Point[] = [];
    // generate horizontal lines
    for (let x = 0; x < this.modelWidth; x += stepSize) {
      if (x < this.modelWidth / 2) {
        const y = yOrigin + (deformationBlock1Speed * Math.cos(deformationBlock1Direction * Math.PI / 180) * progress);
        points.push({ x: x + xOffset, y });
      } else {
        const y = yOrigin + (deformationBlock2Speed * Math.cos(deformationBlock2Direction * Math.PI / 180) * progress);
        points.push({ x: x + xOffset, y });
      }
    }
    return points;
  }

  private generateXDisplacementLine(xOrigin: number, yOffset: number) {

    const { deformationModelStep: step, deformationSimulationProgress: progress,
      deformationBlock1Speed, deformationBlock1Direction, deformationBlock2Speed, deformationBlock2Direction } =
      this.stores.seismicSimulation;

    const steps = 300;
    const stepSize = this.modelWidth / steps;

    const points: Point[] = [];
    // generate vertical lines
    for (let y = 0; y < this.modelWidth; y += stepSize) {
      // having a perfectly straight vertical line makes the line disappear
      const lineFudge = y / 1000;

      // add the x shear over time as the simulation runs
      const block1Sheer = (deformationBlock1Speed * Math.sin(deformationBlock1Direction * Math.PI / 180) * progress);
      const block2Sheer = (deformationBlock2Speed * Math.sin(deformationBlock2Direction * Math.PI / 180) * progress);

      if (xOrigin < this.modelWidth / 2) {
        const x = xOrigin + block1Sheer + lineFudge;
        points.push({ x, y: y + yOffset });
      } else {
        const x = xOrigin + block2Sheer + lineFudge;
        points.push({ x, y: y + yOffset });
      }

    }
    return points;
  }

  private generateGPSStationPoints(modelMarginLeft: number, modelMarginTop: number) {
    const { deformationModelStep: step, deformationSimulationProgress: progress, deformationSites,
      deformationBlock1Speed, deformationBlock1Direction, deformationBlock2Speed, deformationBlock2Direction } =
      this.stores.seismicSimulation;

    // stations will move with the land
    const stationPoints: Point[] = [];
    for (const site of deformationSites) {
      const isBlock1 = site[0] < 0.5;
      const blockSpeed = isBlock1 ? deformationBlock1Speed : deformationBlock2Speed;
      const blockDirection = isBlock1 ? deformationBlock1Direction : deformationBlock2Direction;

      const siteDisplacementX = blockSpeed * Math.sin(blockDirection * Math.PI / 180) * progress;
      const siteDisplacementY = blockSpeed * Math.cos(blockDirection * Math.PI / 180) * progress;

      const x = canvasWidth * site[0] + modelMarginLeft + siteDisplacementX;
      const y = canvasWidth * site[1] + modelMarginTop + siteDisplacementY;
      stationPoints.push({ x, y });
    }
    return stationPoints;
  }
  private gradient(a: Point, b: Point) {
    return (b.y - a.y) / (b.x - a.x);
  }

  // adapted from https://www.geeksforgeeks.org/how-to-draw-smooth-curve-through-multiple-points-using-javascript/
  private bzCurve = (ctx: CanvasRenderingContext2D, f = 0.3, t = 0.6) => (points: Point[]) => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    let m = 0;
    let dx1 = 0;
    let dx2 = 0;
    let dy1 = 0;
    let dy2 = 0;

    let preP = points[0];
    for (let i = 1; i < points.length; i++) {
      const curP = points[i];
      const nexP = points[i + 1];
      if (nexP) {
        m = this.gradient(preP, nexP);
        dx2 = (nexP.x - curP.x) * -f;
        dy2 = dx2 * m * t;
      } else {
        dx2 = 0;
        dy2 = 0;
      }

      ctx.bezierCurveTo(
        preP.x - dx1, preP.y - dy1,
        curP.x + dx2, curP.y + dy2,
        curP.x, curP.y
      );

      dx1 = dx2;
      dy1 = dy2;
      preP = curP;
    }
    ctx.stroke();
}

}
