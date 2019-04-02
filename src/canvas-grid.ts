
export interface ICanvasShape {
  width: number;
  height: number;
  numCols: number;
  numRows: number;
  gridSize: number;
}

export class CanvasGrid {
  protected context: CanvasRenderingContext2D;
  protected geometry: ICanvasShape;

  constructor(element: HTMLCanvasElement, geometry: ICanvasShape) {
    this.geometry = geometry;
    this.setCanvas(element);
  }

  protected clear = () => {
    if (this.context) {
      this.context.clearRect(0, 0, this.geometry.width, this.geometry.height);
    }
  }

  protected makeHSLA = (h: number, s: number, l: number, a: number) => {
    return `hsla(${h * 2.5}, ${s}%, ${l}%, ${a && a / 100})`;
  }

  protected setCanvas = (elem: HTMLCanvasElement) => {
    this.context = elem.getContext("2d") as CanvasRenderingContext2D;
  }

  protected drawInCell(x: number, y: number, drawFunc: (ctx: CanvasRenderingContext2D ) => void) {
    const size = this.geometry.gridSize;
    this.context.save();
    this.context.translate(x * size, y * size);
    drawFunc(this.context);
    this.context.restore();
  }

  protected drawGrid() {
    const {gridSize, width, height, numCols, numRows } = this.geometry;
    for (let x = 0; x < numCols; x++) {
      this.context.beginPath();
      this.context.moveTo( x * gridSize, 0);
      this.context.lineTo( x * gridSize, height);
      this.context.stroke();
    }
    for (let y = 0; y < numRows; y++) {
      this.context.beginPath();
      this.context.moveTo(0, y * gridSize);
      this.context.lineTo(width, y * gridSize);
      this.context.stroke();
    }
  }

  protected drawLabels() {
    const {gridSize, numCols, numRows } = this.geometry;
    const fontSize = 10;
    this.context.font = `${fontSize}px sans-serif`;
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    const offsetY = Math.floor(gridSize / 2);
    const offsetX = offsetY;
    for (let x = 0; x < numCols; x++) {
      this.drawInCell(x, 0, (ctx) => {
        ctx.fillText(`${x}`, offsetX, offsetY);
      });
    }
    for (let y = 0; y < numRows; y++) {
      this.drawInCell(0, y, (ctx) => {
        ctx.fillText(`${y}`, offsetX, offsetY);
      });
    }
  }

}
