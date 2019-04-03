import { CanvasGrid, ICanvasShape } from "./canvas-grid";
import { SimDatumType } from "./stores/volcano-store";

export class CanvasVolcano extends CanvasGrid {
  protected data: SimDatumType[];
  protected code: string;

  constructor(ctx: CanvasRenderingContext2D, geometry: ICanvasShape, data: SimDatumType[]) {
    super(ctx, geometry);
    this.data = data;
  }

  public draw() {
    this.clear();
    this.drawGridCells();
    this.drawLabels();
    this.drawGrid();
  }

  private drawGridCell(x: number, y: number, datum: SimDatumType) {
    const color = this.makeHSLA(0, 0.5, 0.5, datum.thickness * 100);
    this.drawInCell(x, y, (context) => {
      this.context.fillStyle = color;
      this.context.fillRect(0, 0, this.geometry.gridSize - 1, this.geometry.gridSize - 1);
    });
  }

  private drawGridCells() {
    this.data.forEach((datum, index) => {
      const x = index % this.geometry.numCols;
      const y = Math.floor(index / this.geometry.numRows);
      this.drawGridCell(x, y, datum);
    });
  }
}
