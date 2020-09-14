import * as React from "react";

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

const backgroundColor = "#EEE";

const lineSpacing = 35;

export class DeformationModel extends React.Component<IProps> {

  private canvasRef = React.createRef<HTMLCanvasElement>();

  public componentDidMount() {
    this.drawModel();
  }

  public componentDidUpdate() {
    if (this.canvasRef.current) {
      // clear everything
      const ctx = this.canvasRef.current.getContext("2d")!;
      ctx.clearRect(0, 0, this.props.width, this.props.height);
    }
    this.drawModel();
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

  private drawModel() {
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

    // clip all subsquent drawing (this can be re-used when we generate the triangle)
    ctx.beginPath();
    ctx.rect(modelMargin.left, modelMargin.top, this.modelWidth, this.modelWidth);
    ctx.clip();

    const lines: Point[][] = [];
    // start below model and go beyond in case lines curve into model
    const yBounds = [modelMargin.top - 10, modelMargin.top + this.modelWidth + 20];
    const xBounds = [modelMargin.left - 10, modelMargin.left + this.modelWidth + 20];
    // horizontal lines
    for (let y = yBounds[0]; y < yBounds[1]; y += lineSpacing) {
      lines.push(this.generateYDisplacementLine(y, modelMargin.left));
    }
    // vertical lines
    for (let x = xBounds[0]; x < xBounds[1]; x += lineSpacing) {
      lines.push(this.generateXDisplacementLine(x, modelMargin.top));
    }

    const drawBzCurve = this.bzCurve(ctx);
    lines.forEach(drawBzCurve);
  }

  private get modelWidth() {
    const smallestDimension = Math.min(canvasWidth, canvasHeight);
    return smallestDimension - (minModelMargin * 2);
  }

  private generateYDisplacementLine(yOrigin: number, xOffset: number) {
    // simple sine wave for now
    const steps = 300;
    const stepSize = this.modelWidth / steps;
    const points: Point[] = [];
    for (let x = 0; x < this.modelWidth; x += stepSize) {
      const y = yOrigin + Math.sin(x / 10) * 10;
      points.push({x: x + xOffset, y});
    }
    return points;
  }

  private generateXDisplacementLine(xOrigin: number, yOffset: number) {
    // simple sine wave for now
    const steps = 300;
    const stepSize = this.modelWidth / steps;
    const points: Point[] = [];
    for (let y = 0; y < this.modelWidth; y += stepSize) {
      const x = xOrigin + Math.sin(y / 25) * 10;
      points.push({x, y: y + yOffset});
    }
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
