import * as React from "react";

interface IProps {
  width: number;
  height: number;
}

const canvasMargin = {
  top: 10,
  left: 20
};
let canvasWidth = 0;
let canvasHeight = 0;

const minModelMargin = 20;

const backgroundColor = "#EEE";

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

    const smallestDimension = Math.min(canvasWidth, canvasHeight);
    const modelWidth = smallestDimension - (minModelMargin * 2);

    const modelMargin = {
      left: (canvasWidth - modelWidth) / 2,
      top: (canvasHeight - modelWidth) / 2
    };

    const ctx = this.canvasRef.current.getContext("2d")!;

    // draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // draw border
    ctx.beginPath();
    ctx.rect(modelMargin.left, modelMargin.top, modelWidth, modelWidth);
    ctx.stroke();
  }

}
