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
const stationColor = "#e56d44";

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

    // site markers - draw slightly overlaid on the clipped triangle, so need to restore (unclip) canvas
    ctx.restore();
    ctx.fillStyle = stationColor;
    ctx.strokeStyle = textColor;
    ctx.beginPath();
    for (const station of stationPoints){
      ctx.moveTo(station.x, station.y);
      ctx.arc(station.x, station.y, 5, 0, 2 * Math.PI);
    }
    ctx.stroke();
    ctx.fill();

    // show velocity vector arrows for each plate
    // start circle
    ctx.beginPath();
    const points = this.generateVelocityVectorArrows(modelMargin, this.modelWidth);
    ctx.moveTo(points.p1.x, points.p1.y);
    ctx.arc(points.p1.x, points.p1.y, 10, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();

    // vector line
    ctx.beginPath();
    ctx.moveTo(points.p1.x, points.p1.y);
    ctx.lineTo(points.p1v.x, points.p1v.y);
    ctx.stroke();

    // plate 2 circle
    ctx.beginPath();
    ctx.moveTo(points.p2.x, points.p2.y);
    ctx.arc(points.p2.x, points.p2.y, 10, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();

    // plate 2 vector line
    ctx.beginPath();
    ctx.moveTo(points.p2.x, points.p2.y);
    ctx.lineTo(points.p2v.x, points.p2v.y);
    ctx.stroke();
  }

  private get modelWidth() {
    const smallestDimension = Math.min(canvasWidth, canvasHeight);
    return smallestDimension - (minModelMargin * 2);
  }

  private generateYDisplacementLine(yOrigin: number, xOffset: number) {

    const { deformationModelStep: step, deformationSimulationProgress: progress,
      deformSpeedPlate1, deformDirPlate1, deformSpeedPlate2, deformDirPlate2 } =
      this.stores.seismicSimulation;

    const steps = 300;
    const stepSize = this.modelWidth / steps;

    const points: Point[] = [];
    // generate horizontal lines
    for (let x = 0; x < this.modelWidth; x += stepSize) {
      if (x < this.modelWidth / 2) {
        const y = yOrigin + (deformSpeedPlate1 * Math.cos(deformDirPlate1 * Math.PI / 180) * progress);
        points.push({ x: x + xOffset, y });
      } else {
        const y = yOrigin + (deformSpeedPlate2 * Math.cos(deformDirPlate2 * Math.PI / 180) * progress);
        points.push({ x: x + xOffset, y });
      }
    }
    return points;
  }

  private generateXDisplacementLine(xOrigin: number, yOffset: number) {

    const { deformationModelStep: step, deformationSimulationProgress: progress,
      deformSpeedPlate1, deformDirPlate1, deformSpeedPlate2, deformDirPlate2 } =
      this.stores.seismicSimulation;

    const steps = 300;
    const stepSize = this.modelWidth / steps;

    const points: Point[] = [];
    // generate vertical lines
    for (let y = 0; y < this.modelWidth; y += stepSize) {
      // having a perfectly straight vertical line makes the line disappear
      const lineFudge = y / 1000;

      // add the x shear over time as the simulation runs
      const block1Sheer = (deformSpeedPlate1 * Math.sin(deformDirPlate1 * Math.PI / 180) * progress);
      const block2Sheer = (deformSpeedPlate2 * Math.sin(deformDirPlate2 * Math.PI / 180) * progress);

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
      deformSpeedPlate1, deformDirPlate1, deformSpeedPlate2, deformDirPlate2 } =
      this.stores.seismicSimulation;

    // stations will move with the land
    const stationPoints: Point[] = [];
    for (const site of deformationSites) {
      const isBlock1 = site[0] < 0.5;
      const blockSpeed = isBlock1 ? deformSpeedPlate1 : deformSpeedPlate2;
      const blockDirection = isBlock1 ? deformDirPlate1 : deformDirPlate2;

      const siteDisplacementX = blockSpeed * Math.sin(blockDirection * Math.PI / 180) * progress;
      const siteDisplacementY = blockSpeed * Math.cos(blockDirection * Math.PI / 180) * progress;

      const x = canvasWidth * site[0] + modelMarginLeft + siteDisplacementX;
      const y = canvasWidth * site[1] + modelMarginTop + siteDisplacementY;
      stationPoints.push({ x, y });
    }
    return stationPoints;
  }

  private generateVelocityVectorArrows(modelMargin: any, modelWidth: number) {
    const {
      deformSpeedPlate1, deformDirPlate1, deformSpeedPlate2, deformDirPlate2 } =
      this.stores.seismicSimulation;

    const p1 = { x: modelMargin.left + 30, y: modelMargin.top - 50 };
    const p1vx = p1.x + deformSpeedPlate1 * Math.sin(deformDirPlate1 * Math.PI / 180);
    const p1vy = p1.y + deformSpeedPlate1 * Math.cos(deformDirPlate1 * Math.PI / 180);

    const p2 = { x: modelMargin.left + modelWidth - 30, y: modelMargin.top - 50 };
    const p2vx = p2.x + deformSpeedPlate2 * Math.sin(deformDirPlate2 * Math.PI / 180);
    const p2vy = p2.y + deformSpeedPlate2 * Math.cos(deformDirPlate2 * Math.PI / 180);

    const points = {
      p1,
      p1v: {x: p1vx, y: p1vy},
      p2,
      p2v: {x: p2vx, y: p2vy}
    };
    return points;
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
