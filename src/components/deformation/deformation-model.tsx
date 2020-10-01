import * as React from "react";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";
import { IDisposer, onAction } from "mobx-state-tree";
import { deg2rad } from "../../utilities/coordinateSpaceConversion";

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
const modelMargin = {
  left: 0,
  top: 0
};
const minModelMargin = 20;

const backgroundColor = "#eee";
const lineColor = "#777";
const drawAreaColor = "#fff";
const textColor = "#333";
const stationColor = "#e56d44";

const lineSpacing = 20;
// should be in km
const lockingDepth = 1;
// for converting pixels to world distance
const distanceScale = 2;

const deg2Rad = (degreeAngle: number) => {
  return degreeAngle * Math.PI / 180;
};
// angle between the plates vertically (into the Earth)
const plateDipAngle = deg2Rad(90);

@inject("stores")
@observer
export class DeformationModel extends BaseComponent<IProps, {}> {

  private canvasRef = React.createRef<HTMLCanvasElement>();
  private disposer: IDisposer;

  private get modelWidth() {
    const smallestDimension = Math.min(canvasWidth, canvasHeight);
    return smallestDimension - (minModelMargin * 2);
  }
  private get stepSize() {
    const steps = 30;
    return this.modelWidth / steps;
  }

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
    const relativeStyle: React.CSSProperties = { position: "relative", width, height };
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

    modelMargin.left = (canvasWidth - this.modelWidth) / 2;
    modelMargin.top = (canvasHeight - this.modelWidth) / 2;

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
    ctx.strokeStyle = stationColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 5]);
    ctx.moveTo(modelMargin.left + (this.modelWidth / 2), modelMargin.top);
    ctx.lineTo(modelMargin.left + (this.modelWidth / 2), this.modelWidth + modelMargin.top);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = textColor;

    // set up the GPS site positions
    const stationPoints = this.generateGPSStationPoints();
    const startPoint = stationPoints[0];

    // text labels
    // labels must be drawn before we clip the canvas
    ctx.font = "20px Arial";
    ctx.fillStyle = textColor;
    ctx.beginPath();
    for (let i = 0; i < stationPoints.length; i++) {
      ctx.textAlign = stationPoints[i].x < this.modelWidth / 2 ? "right" : "left";
      const textPositionAdjust = stationPoints[i].x < this.modelWidth / 2 ? -10 : 10;
      ctx.fillText(`Station ${i}`, stationPoints[i].x + textPositionAdjust, stationPoints[i].y);
    }
    ctx.stroke();

    // Draw lines between stations to form a triangle
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    for (const station of stationPoints) {
      ctx.lineTo(station.x, station.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.save();
    // now we stop the deformation lines appearing outside of the area
    // useful to disable this while debugging!
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
    ctx.strokeStyle = lineColor;
    const drawBzCurve = this.bzCurve(ctx);
    lines.forEach(drawBzCurve);

    // site markers - draw slightly overlaid on the clipped triangle, so need to restore (unclip) canvas
    ctx.restore();
    ctx.fillStyle = stationColor;
    ctx.strokeStyle = textColor;
    ctx.beginPath();
    for (const station of stationPoints) {
      ctx.moveTo(station.x, station.y);
      ctx.arc(station.x, station.y, 5, 0, 2 * Math.PI);
    }
    ctx.stroke();
    ctx.fill();

    // show velocity vector arrows for each plate
    // start with a circle - no design spec for this yet
    ctx.beginPath();
    const points = this.generateVelocityVectorArrows(this.modelWidth);
    ctx.moveTo(points.p1.x, points.p1.y);
    ctx.arc(points.p1.x, points.p1.y, 7, 0, 2 * Math.PI);
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
    ctx.arc(points.p2.x, points.p2.y, 7, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();

    // plate 2 vector line
    ctx.beginPath();
    ctx.moveTo(points.p2.x, points.p2.y);
    ctx.lineTo(points.p2v.x, points.p2v.y);
    ctx.stroke();

    // Scale
    const s1 = { x: this.modelWidth / 2 - modelMargin.left, y: modelMargin.top - 50 };
    const s2 = { x: s1.x + this.worldToCanvas(20), y: s1.y };
    ctx.beginPath();
    ctx.moveTo(s1.x, s1.y);
    ctx.lineTo(s2.x, s2.y);
    // end caps
    ctx.moveTo(s1.x, s1.y - 5);
    ctx.lineTo(s1.x, s1.y + 5);
    ctx.moveTo(s2.x, s2.y - 5);
    ctx.lineTo(s2.x, s2.y + 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = textColor;
    ctx.font = "16px Arial";
    ctx.fillText(`20km`, s1.x + modelMargin.left + 20, s1.y + 20);
    ctx.stroke();

  }

  private generateYDisplacementLine(yOrigin: number, xOffset: number) {
    const { deformationSimulationProgress: progress,
      deformSpeedPlate1, deformDirPlate1, deformSpeedPlate2, deformDirPlate2 } =
      this.stores.seismicSimulation;

    const center = this.modelWidth / 2;
    const points: Point[] = [];

    // generate horizontal lines
    for (let x = 0; x < this.modelWidth; x += this.stepSize) {
      // xDist is always distance FROM the center fault line. xOffset is the left margin
      const xDist = this.canvasToWorld(Math.abs(center - x));

      const plateSpeed = (x < center) ? deformSpeedPlate1 : deformSpeedPlate2;
      const plateDir = (x < center) ? deformDirPlate1 : deformDirPlate2;
      const dip = (x < center) ? plateDipAngle : plateDipAngle;

      // distance is measured from the center fault
      const verticalSheer =
        this.calculateVerticalSheer(xDist, plateSpeed * Math.cos(deg2rad(plateDir)), dip) * progress;
      const horizontalSheer =
        this.calculateHorizontalSheer(xDist, plateSpeed * Math.sin(deg2rad(plateDir)), dip) * progress;

      const newY = yOrigin + this.worldToCanvas(verticalSheer);
      const newX = x + xOffset + this.worldToCanvas(horizontalSheer);
      points.push({ x: newX, y: newY });
    }
    return points;
  }

  private generateXDisplacementLine(xOrigin: number, yOffset: number) {
    const { deformationSimulationProgress: progress,
      deformSpeedPlate1, deformDirPlate1, deformSpeedPlate2, deformDirPlate2 } =
      this.stores.seismicSimulation;

    const center = this.modelWidth / 2;
    const points: Point[] = [];

    // generate vertical lines
    for (let y = 0; y < this.modelWidth; y += this.stepSize) {
      // xDist is always distance FROM the fault line - should not be negative
      const xDist = this.canvasToWorld(Math.abs(center - xOrigin));
      const plateSpeed = (xOrigin < center) ? deformSpeedPlate1 : deformSpeedPlate2;
      const plateDir = (xOrigin < center) ? deformDirPlate1 : deformDirPlate2;
      const dip = (xOrigin < center) ? plateDipAngle : plateDipAngle;

      // add the x shear over time as the simulation runs
      // our distance is measured from the center fault
      const horizontalSheer =
        this.calculateHorizontalSheer(xDist, plateSpeed * Math.sin(deg2rad(plateDir)), dip) * progress;
      // add the y shear component
      const verticalSheer =
        this.calculateVerticalSheer(xDist, plateSpeed * Math.cos(deg2rad(plateDir)), dip) * progress;

      // having a perfectly straight vertical line makes the line disappear
      const lineFudge = y / 1000;
      const newX = xOrigin + this.worldToCanvas(horizontalSheer) + lineFudge;
      const newY = y + yOffset + this.worldToCanvas(verticalSheer);

      points.push({ x: newX, y: newY });
    }
    return points;
  }

  private generateGPSStationPoints() {
    const { deformationSimulationProgress: progress, deformationSites,
      deformSpeedPlate1, deformDirPlate1, deformSpeedPlate2, deformDirPlate2 } =
      this.stores.seismicSimulation;

    // stations will move with the land
    const stationPoints: Point[] = [];
    for (const site of deformationSites) {
      // get speed by determining which side of fault
      // station x and y are stored in the array as 0-1 percentage across the canvas
      const plateSpeed = site[0] < 0.5 ? deformSpeedPlate1 : deformSpeedPlate2;
      const plateDir = site[0] < 0.5 ? deformDirPlate1 : deformDirPlate2;
      // plate dip is a constant between the plates
      const dip = site[0] < 0.5 ? plateDipAngle : plateDipAngle;

      const siteDisplacementX = this.calculateHorizontalSheer(
        this.percentToWorld(site[0]), plateSpeed * Math.sin(deg2rad(plateDir)), dip) * progress;
      const siteDisplacementY = this.calculateVerticalSheer(
        this.percentToWorld(site[0]), plateSpeed * Math.cos(deg2rad(plateDir)), dip) * progress;

      const x = this.modelWidth * site[0] + modelMargin.left + this.worldToCanvas(siteDisplacementX);
      const y = this.modelWidth * site[1] + modelMargin.top + this.worldToCanvas(siteDisplacementY);
      stationPoints.push({ x, y });
    }
    return stationPoints;
  }

  // Calculations taken from PowerPoint linked here: https://www.pivotaltracker.com/story/show/174401018
  // Note: the calculations on that PPT assume displacement along a horizontal fault, so they have been switched
  private calculateHorizontalSheer(px: number, speed: number, dip: number) {
    const horizontalSheer = speed / Math.PI *
      (Math.cos(dip) * Math.atan(px / lockingDepth) - dip + Math.PI / 2) -
      px * (lockingDepth * Math.cos(dip) + px * (Math.sin(dip)))
      / (Math.pow(px, 2) + Math.pow(lockingDepth, 2));
    return horizontalSheer;
  }

  private calculateVerticalSheer(px: number, speed: number, dip: number) {
    const verticalSheer = speed / Math.PI *
    (Math.sin(dip) * Math.atan(px / lockingDepth) - dip + Math.PI / 2) +
    lockingDepth * (lockingDepth * Math.cos(dip) + px * Math.sin(dip))
    / (Math.pow(px, 2) + Math.pow(lockingDepth, 2));
    return verticalSheer;
  }

  private canvasToWorld(canvasPosition: number) {
    return canvasPosition / distanceScale;
  }

  // GPS stations are positioned as a percentage 0-1 across the model area
  private percentToWorld(distancePercentage: number) {
    // const percentageFromCenter = Math.abs(0.5 - distancePercentage);
    return distancePercentage * this.modelWidth / distanceScale;
  }
  private worldToCanvas(distanceInRealUnits: number) {
    return distanceInRealUnits * distanceScale;
  }

  // Visual representation of the plate velocities based on student values
  private generateVelocityVectorArrows(modelWidth: number) {
    const {
      deformSpeedPlate1, deformDirPlate1, deformSpeedPlate2, deformDirPlate2 } =
      this.stores.seismicSimulation;

    // line starts at given point
    const p1 = { x: modelMargin.left + 30, y: modelMargin.top - 50 };
    // calculate end canvas position of line to represent the magnitude and direction of movement
    const p1vx = p1.x + deformSpeedPlate1 * Math.sin(deformDirPlate1 * Math.PI / 180);
    const p1vy = p1.y + deformSpeedPlate1 * Math.cos(deformDirPlate1 * Math.PI / 180);

    const p2 = { x: modelMargin.left + modelWidth - 30, y: modelMargin.top - 50 };
    const p2vx = p2.x + deformSpeedPlate2 * Math.sin(deformDirPlate2 * Math.PI / 180);
    const p2vy = p2.y + deformSpeedPlate2 * Math.cos(deformDirPlate2 * Math.PI / 180);

    // points returns the start and end point of the lines to be drawn for plate 1 and plate 2
    const points = {
      p1,
      p1v: { x: p1vx, y: p1vy },
      p2,
      p2v: { x: p2vx, y: p2vy }
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
