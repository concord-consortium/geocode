import gridTephraCalc from "./tephra2";

const canvasSize = 500;
const gridCellSize = 10;

const numRows = canvasSize / gridCellSize;
const numCols = numRows;
const VOLCANO_CENTER = { x: numCols / 2 - 0.5, y: numRows / 2 - 0.5};

const rand = (max: number) => Math.random() * max - (max / 2);

const makeHSLA = (h: number, s: number, l: number, a: number) => {
  return `hsla(${h * 2.5}, ${s}%, ${l}%, ${a && a / 100})`;
};

class GridCell {
  public thickness: number;

  public fromXY(gridX: number, gridY: number, vX: number, vY: number){
    this.thickness = gridTephraCalc(gridX, gridY, vX, vY);
  }

  public clear() {
    this.thickness = 0;
  }
}

export type IDrawingFunction = (cell: GridCell, context: CanvasRenderingContext2D) => void;

export default class Volcano {
  public wind = { x: rand(500), y: rand(500) };
  private code = ";";
  private context: CanvasRenderingContext2D | null;
  private gridCells: GridCell[] = [];
  private center = {x: canvasSize / 2.0, y: canvasSize / 2.0};
  private baseMap: HTMLImageElement;

  constructor(element: HTMLCanvasElement|null) {
    this.baseMap = (document.getElementById("base-map") as HTMLImageElement);
    this.setCanvas(element);
  }

  public run(){
    this.gridCells = [];
    for (let x = 0; x < numCols; x++) {
      for (let y = 0; y < numRows; y++ ) {
        const cell = new GridCell();
        // First grid index is 0 so 4.5 is the middle of our grid.
        cell.fromXY(x, y, VOLCANO_CENTER.x, VOLCANO_CENTER.y);
        this.gridCells.push(cell);
      }
    }

    if (this.context) {
      this.context.clearRect(0, 0, canvasSize, canvasSize);
      this.drawGridCells();
      this.drawCaldera(this.context);
      this.drawBaseMap(this.context);
    }
  }

  public setCanvas = (elem: HTMLCanvasElement | null) => {
    if (elem) {
      this.context = elem.getContext("2d");
    }
  }

  public setBlocklyCode = (code: string) => {
   this.code = code;
  }

  private drawGridCell(x: number, y: number, gridCell: GridCell) {
    const fillGridCell = (h: number, s: number, l: number, a: number) => {
      if (this.context) {
        this.context.fillStyle = makeHSLA(h, s, l, a);
        this.context.fillRect(0, 0, gridCellSize - 1, gridCellSize - 1);
      }
    };
    if (this.context) {
      this.context.save();
      this.context.translate(x * gridCellSize, y * gridCellSize);
      const context = {
        x,
        y,
        context: this.context,
        cell: gridCell,
        count: gridCell.thickness,
        size: gridCell.thickness,
        thickness: gridCell.thickness,
        fill: fillGridCell
      };
      const evalCode = () => {
        try {
          // tslint:disable-next-line
          eval(this.code);
        }
        catch (e) {
          console.log(e);
        }
      };
      evalCode.call(context);
      this.context.restore();
    }
  }

  private drawGridCells() {
    this.gridCells.forEach((gridCell, index) => {
      const c = this.context as CanvasRenderingContext2D;
      const x = index % numRows;
      const y = Math.floor(index / numRows);
      this.drawGridCell(x, y, gridCell);
    });
  }

  private drawCaldera(context: CanvasRenderingContext2D) {
    context.strokeStyle = "black";
    context.strokeRect(this.center.x - 5, this.center.y - 5, 10, 10);
  }

  private drawBaseMap(context: CanvasRenderingContext2D) {
    context.imageSmoothingEnabled = false;
    context.drawImage(this.baseMap, 0, 0, canvasSize, canvasSize);
  }

}
