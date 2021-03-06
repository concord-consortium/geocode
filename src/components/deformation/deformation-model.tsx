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
  top: 5,
  left: 8
};
let canvasWidth = 0;
let canvasHeight = 0;
const modelMargin = {
  left: 0,
  top: 0
};
const minModelMargin = 20;

const backgroundColor = "#e6f2e4";
const lineColor = "#777";
const drawAreaColor = "#fff";
const textColor = "#434343";
const stationColor = "#98E643";
const faultColor = "#ff9300";
const initialPlateAlpha = .07;
const stationBorderThickness = 2;

const lineSpacing = 20;
// should be in km
const lockingDepth = 1;
// for converting pixels to world distance
// we want the area shown to be approx this size in each direction
const distanceScale = 50;

// angle between the plates vertically (into the Earth)
const dip = deg2rad(90);

// to calculate the total horizontal displacement from an originX at year Y, we have to sum all the displacements
// from year 0 to year Y. When Y > 100,000, this starts getting slow. Therefore we cache previous calculations
// and add to them as necessary, as year/displacement tuples for any origin,
// {originX: [[yearI, displacementI], [yearJ, displacementJ]]}
// As the year increases, we can look up our latest value and calculate from there. If we run again with the same
// horizontal speed, we will re-use this ame cache (though will not cache any more values). Since the timings of
// a second run will be different, we will still need to find the cache with the previous year and step from there,
// but this is significantly faster.
// A typical cache for any xOrigin tends to be about 300 year/displacement tuples.
interface DisplacementCache { [origin: number]: number[][]; }
let cachedHorizontalSpeed = 0;
let cachedHorizontalDisplacements: DisplacementCache = {};

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
    const steps = 100;
    return this.modelWidth / steps;
  }

  public componentDidMount() {
    this.drawModel();
    this.disposer = onAction(this.stores.seismicSimulation, this.drawModel, true);
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
    ctx.clip();

    // show fault line
    ctx.beginPath();
    ctx.strokeStyle = faultColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 5]);
    ctx.moveTo(modelMargin.left + (this.modelWidth / 2), modelMargin.top);
    ctx.lineTo(modelMargin.left + (this.modelWidth / 2), this.modelWidth + modelMargin.top);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = textColor;

    const { deformationModelStep: year } = this.stores.seismicSimulation;
    const vSpeed = this.getRelativeVerticalSpeed();     // mm/yr
    const hSpeed = this.getRelativeHorizontalSpeed();

    // plates
    if (year < 50000) {
      const plateAlpha = initialPlateAlpha - (year / 50000) * initialPlateAlpha;
      ctx.fillStyle = `rgba(255,58,58,${plateAlpha})`;
      ctx.beginPath();
      ctx.rect(modelMargin.left, modelMargin.top, this.modelWidth / 2, this.modelWidth + modelMargin.top);
      ctx.fill();

      ctx.fillStyle = `rgba(219,194,58,${plateAlpha})`;
      ctx.beginPath();
      ctx.rect(modelMargin.left + (this.modelWidth / 2), modelMargin.top,
        this.modelWidth / 2, this.modelWidth + modelMargin.top);
      ctx.fill();
    }

    if (cachedHorizontalSpeed !== hSpeed) {
      // reset horizontal displacement cache
      cachedHorizontalSpeed = hSpeed;
      cachedHorizontalDisplacements = {};
    }

    // set up the GPS site positions
    const stationPoints = this.generateGPSStationPoints(vSpeed, hSpeed, year);
    const startPoint = stationPoints[0];

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

    // Deformation lines
    const horizontalLines: Point[][] = [];
    const verticalLines: Point[][] = [];

    // horizontal lines start below model and go beyond in case lines curve into model
    const yBounds = [modelMargin.top - 10, modelMargin.top + this.modelWidth + 20];
    // vertical lines remain vertical and can be clipped to frame
    const xBounds = [modelMargin.left - 10, modelMargin.left + this.modelWidth + 20];

    // form "horizontal" lines, one for each step vertically
    // (this is slightly inefficient, because they all have the same shape, but the calc is fast)
    for (let y = yBounds[0]; y < yBounds[1]; y += lineSpacing) {
      horizontalLines.push(this.generateHorizontalLine(y, modelMargin.left, vSpeed, year));
    }
    // form vertical lines, one for each step horizontally
    for (let x = xBounds[0]; x < xBounds[1]; x += lineSpacing) {
      verticalLines.push(this.generateVerticalLine(x, modelMargin.top, hSpeed, year));
    }

    ctx.strokeStyle = lineColor;
    const drawBzCurve = this.bzCurve(ctx);
    horizontalLines.forEach(drawBzCurve);

    verticalLines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line[0].x, line[0].y);
      ctx.lineTo(line[1].x, line[1].y);
      ctx.closePath();
      ctx.stroke();
    });

    // unclip from triangle
    ctx.restore();

    // draw the fainter lines behind triangle that will fade
    if (year < 50000) {
      ctx.save();
      const alpha = 0.5 - (year / 50000) * 0.5;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
      horizontalLines.forEach(drawBzCurve);

      verticalLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        ctx.lineTo(line[1].x, line[1].y);
        ctx.closePath();
        ctx.stroke();
      });
      ctx.restore();
    }

    // text labels
    ctx.font = "15px Lato";
    ctx.fillStyle = textColor;
    ctx.beginPath();

    ctx.textAlign = "center";
    ctx.fillText("Plate 1",
      modelMargin.left + this.modelWidth / 4, modelMargin.top + 20);
    ctx.fillText("Plate 2",
      modelMargin.left + this.modelWidth / 4 * 3, modelMargin.top + 20);

    ctx.font = "13px Lato";
    for (let i = 0; i < stationPoints.length; i++) {
      ctx.textAlign = stationPoints[i].x < this.modelWidth / 2 ? "right" : "left";
      const textPositionAdjust = stationPoints[i].x < this.modelWidth / 2 ? -10 : 10;
      ctx.fillText(`Station ${i + 1}`, stationPoints[i].x + textPositionAdjust, stationPoints[i].y + 5);
    }
    ctx.font = "15px Lato";
    ctx.textAlign = "end";
    ctx.fillText(`Year ${year.toLocaleString()}`,
      modelMargin.left + this.modelWidth - 10, modelMargin.top + this.modelWidth - 10);
    ctx.stroke();

    ctx.font = "15px Lato";
    ctx.fillText("Fault", modelMargin.left + this.modelWidth / 2 - 10, modelMargin.top + this.modelWidth - 10);

    // station dots
    ctx.fillStyle = stationColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = stationBorderThickness;
    ctx.beginPath();
    for (const station of stationPoints) {
      ctx.moveTo(station.x, station.y);
      ctx.arc(station.x, station.y, 6, 0, 2 * Math.PI);
    }
    ctx.stroke();
    ctx.fill();

    // Scale
    ctx.lineWidth = 1;
    const s1 = { x: modelMargin.left + this.modelWidth / 2 - this.worldToCanvas(5) - 10, y: modelMargin.top + 20 };
    const s2 = { x: s1.x + this.worldToCanvas(5), y: s1.y };
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
    ctx.textAlign = "start";
    ctx.fillStyle = textColor;
    ctx.font = "13px Lato";
    ctx.fillText(`5km`, s1.x, s1.y + 20);
    ctx.stroke();
  }

  private getRelativeVerticalSpeed() {
    const { deformSpeedPlate1, deformDirPlate1, deformSpeedPlate2, deformDirPlate2 } =
      this.stores.seismicSimulation;

    const plate1VerticalSpeed = Math.cos(deg2rad(deformDirPlate1)) * deformSpeedPlate1;
    const plate2VerticalSpeed = Math.cos(deg2rad(deformDirPlate2)) * deformSpeedPlate2;

    const relativeSpeed = plate1VerticalSpeed - plate2VerticalSpeed;
    return relativeSpeed;
  }

  private getRelativeHorizontalSpeed() {
    const { deformSpeedPlate1, deformDirPlate1, deformSpeedPlate2, deformDirPlate2 } =
      this.stores.seismicSimulation;

    const plate1HorizontalSpeed = Math.sin(deg2rad(deformDirPlate1)) * deformSpeedPlate1;
    const plate2HorizontalSpeed = Math.sin(deg2rad(deformDirPlate2)) * deformSpeedPlate2;

    const relativeSpeed = plate1HorizontalSpeed - plate2HorizontalSpeed;
    return relativeSpeed;
  }

  private generateHorizontalLine(yOrigin: number, xOffset: number, relativeVerticalSpeed: number, year: number) {
    const center = this.modelWidth / 2;
    const points: Point[] = [];

    // generate vertical displacements along a horizontal line
    for (let x = 0; x < this.modelWidth; x += this.stepSize) {
      // xDist is always distance from the center fault line
      const xDist = this.canvasToWorld(center - x);

      // distance is measured from the center fault
      const verticalDisplacement =
        this.calculateVerticalDisplacement(xDist, relativeVerticalSpeed, year);

      const newY = yOrigin + this.worldToCanvas(verticalDisplacement);
      const newX = x + xOffset; // + this.worldToCanvas(horizontalSheer);
      points.push({ x: newX, y: newY });
    }
    return points;
  }

  // vertical lines are always precisely straight, so just require two points
  private generateVerticalLine(xOrigin: number, yOffset: number, relativeHorizontalSpeed: number, year: number) {
    const center = (this.modelWidth / 2) + modelMargin.left;

    // xDist is always distance from the fault line.
    const xDist = this.canvasToWorld(center - xOrigin);
    const horizontalDisplacement = this.calculateHorizontalDisplacement(xDist, relativeHorizontalSpeed, year);

    const newX = xOrigin - this.worldToCanvas(horizontalDisplacement);

    const points: Point[] = [{x: newX, y: yOffset}, {x: newX, y: yOffset + this.modelWidth}];

    return points;
  }

  private generateGPSStationPoints(relativeVerticalSpeed: number, relativeHorizontalSpeed: number, year: number) {
    const { deformationSites } = this.stores.seismicSimulation;
    // stations will move with the land
    const stationPoints: Point[] = [];
    for (const site of deformationSites) {
      // get speed by determining which side of fault
      // station x and y are stored in the array as 0-1 percentage across the canvas
      const siteDisplacementX = this.calculateHorizontalDisplacement(
        this.percentToWorld(site[0] - 0.5), relativeHorizontalSpeed, year);
      const siteDisplacementY = this.calculateVerticalDisplacement(
        this.percentToWorld(site[0] - 0.5), relativeVerticalSpeed, year);

      const x = this.modelWidth * site[0] + modelMargin.left + this.worldToCanvas(siteDisplacementX);
      const y = this.modelWidth * site[1] + modelMargin.top - this.worldToCanvas(siteDisplacementY);
      stationPoints.push({ x, y });
    }
    return stationPoints;
  }

  // Calculations taken from PowerPoint linked here: https://www.pivotaltracker.com/story/show/174401018
  private calculateVerticalDisplacement(px: number, vSpeed: number, year: number) {
    const verticalSlipRatemmYr = vSpeed / Math.PI *
      (Math.cos(dip) * (Math.atan(px / lockingDepth) - dip + Math.PI / 2) -
      (px * (lockingDepth * Math.cos(dip) + px * Math.sin(dip)))
      / (px * px + lockingDepth * lockingDepth));                   // mm/yr
    const verticalSlipRateKmYr = verticalSlipRatemmYr / 1000000;
    const verticalDisplacement = verticalSlipRateKmYr * year;       // km
    return (px > 0 ? -verticalDisplacement : verticalDisplacement);
  }

  private calculateHorizontalDisplacement(originalX: number, hSpeed: number, year: number) {
    if (Math.abs(hSpeed) < 1e-10) {
      return 0;
    }
    let earlierYear = 0;
    let totalDisplacement = 0;
    // check if we have already cached previous values
    if (cachedHorizontalDisplacements[originalX] ) {
      const exactCache = cachedHorizontalDisplacements[originalX].find(cache => cache[0] === year);
      if (exactCache) return exactCache[1];
      // if (cachedHorizontalDisplacements[originalX].length > 10) debugger;
      const latestCache = cachedHorizontalDisplacements[originalX].slice().reverse().find(cache => cache[0] < year);
      if (latestCache) {
        earlierYear = latestCache[0];
        totalDisplacement = latestCache[1];
      }
    } else {
      cachedHorizontalDisplacements[originalX] = [];
    }

    for ( ; earlierYear < year; earlierYear++) {
      const px = originalX + totalDisplacement;
      const horizontalSlipRateKmYr = (-hSpeed / Math.PI *
        (Math.sin(dip) * (Math.atan(px / lockingDepth) - dip + Math.PI / 2) +
        (lockingDepth * (lockingDepth * Math.cos(dip) + px * Math.sin(dip)))
        / (px * px + lockingDepth * lockingDepth))) / 1000000;

      totalDisplacement += horizontalSlipRateKmYr;
    }

    if (cachedHorizontalDisplacements[originalX].length === 0 ||
        year > cachedHorizontalDisplacements[originalX][cachedHorizontalDisplacements[originalX].length - 1][0]) {
      // don't insert any caches out of order
      cachedHorizontalDisplacements[originalX].push([year, totalDisplacement]);
    }

    return totalDisplacement;
  }

  private canvasToWorld(canvasPosition: number) {
    // screen size affects pixel scale
    // distanceScale is how many real-world units we want to show across the pixel grid
    return canvasPosition / this.modelWidth *  distanceScale;
  }

  // GPS stations are positioned as a percentage 0-1 across the model area
  private percentToWorld(distancePercentage: number) {
    return distancePercentage * distanceScale;
  }
  private worldToCanvas(distanceInRealUnits: number) {
    return distanceInRealUnits / distanceScale * this.modelWidth;
  }

  // Visual representation of the plate velocities based on student values
  private generateVelocityVectorArrows(modelWidth: number) {
    const {
      deformSpeedPlate1, deformDirPlate1, deformSpeedPlate2, deformDirPlate2 } =
      this.stores.seismicSimulation;

    // line starts at given point
    const p1 = { x: modelMargin.left + 30, y: modelMargin.top + 50 };
    // calculate end canvas position of line to represent the magnitude and direction of movement
    const p1vx = p1.x + deformSpeedPlate1 * Math.sin(deformDirPlate1 * Math.PI / 180);
    const p1vy = p1.y + deformSpeedPlate1 * Math.cos(deformDirPlate1 * Math.PI / 180);

    const p2 = { x: modelMargin.left + modelWidth - 30, y: modelMargin.top + 50 };
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
