import { CanvasGrid, ICanvasShape } from "./canvas-grid";
import { SimDatumType } from "./models/volcano-store";

export class CanvasVolcano extends CanvasGrid {
  protected data: SimDatumType[];
  protected code: string;

  constructor(element: HTMLCanvasElement, geometry: ICanvasShape, data: SimDatumType[]) {
    super(element, geometry);
    this.data = data;
  }

  public setBlocklyCode = (code: string) => {
   this.code = code;
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


  // private drawCaldera(context: CanvasRenderingContext2D) {
  //   context.strokeStyle = "black";
  //   console.log("draw caldera");
  //   if (this.simulation) {
  //     const x = this.simulation.volcanoX;
  //     const y = this.simulation.volcanoY;
  //     console.log(`x : ${x}`);
  //     const height = gridCellSize;
  //     context.strokeRect(x * height - height / 2, y * height - height / 2, height, height);
  //   }
  // }

  // private drawTowns(context: CanvasRenderingContext2D) {
  //   context.strokeStyle = "black";
  //   context.strokeRect(this.center.x - 5, this.center.y - 5, 10, 10);
  // }

  // private drawBaseMap(context: CanvasRenderingContext2D) {
  //   context.imageSmoothingEnabled = false;
  //   // context.drawImage(this.baseMap, 0, 0, canvasSize, canvasSize);
  // }

}
