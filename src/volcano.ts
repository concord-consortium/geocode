import Rock from "./rock";

const canvasSize = 500;
const gridCellSize = 20;
const numRows = canvasSize / gridCellSize;
const numCols = numRows;

const rand = (max: number) => Math.random() * max - (max / 2);

const makeHSLA = (h: number, s: number, l: number, a: number) => {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
};

class GridCell {
  public rocks: Rock[] = [];
  public rockCount() {
    return this.rocks.length;
  }

  public avgRockSize() {
    if (this.rocks.length < 1) {
      return 0;
    }
    return this.rocks.reduce( (prev, current) => (prev as number) + current.size, 0)
      / this.rocks.length;
  }

  public addRock(rock: Rock) {
    this.rocks.push(rock);
  }

  public clear() {
    this.rocks = [];
  }
}

export type IDrawingFunction = (cell: GridCell, context: CanvasRenderingContext2D) => void;

export default class Volcano {
  public wind = { x: rand(500), y: rand(500) };
  private code = "console.log('code');";
  private context: CanvasRenderingContext2D | null;
  private gridCells: GridCell[] = [];
  private center = {x: canvasSize / 2.0, y: canvasSize / 2.0};
  private baseMap: HTMLImageElement;

  constructor(element: HTMLCanvasElement|null) {
    this.baseMap = (document.getElementById("base-map") as HTMLImageElement);
    this.setCanvas(element);
  }

  public run() {
    this.gridCells = [];
    for (let x = 0; x < numCols; x++) {
      for (let y = 0; y < numRows; y++ ) {
        this.gridCells.push(new GridCell());
      }
    }
    for (let i = 0; i < 400; i++) { this.addRock(); }

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
   console.log(code);
   this.code = code;
  }

  private oldDrawGridCell = (cell: GridCell, context: CanvasRenderingContext2D) => {
    const size = cell.avgRockSize();
    const count = cell.rockCount();
    const max = 10;
    const darkness = count < 1 ? 0 : count / max * 100;
    const color = makeHSLA(0, 100, 100 - darkness, 1.0);
    context.fillStyle = color;
    context.fillRect(0, 0, gridCellSize - 1, gridCellSize - 1);
  }

  private drawGridCell(x: number, y: number, gridCell: GridCell) {
    if (this.context) {
      this.context.save();
      this.context.translate(x * gridCellSize, y * gridCellSize);
      const context = {
        x,
        y,
        context: this.context,
        cell: gridCell,
        count: gridCell.rockCount,
        rocks: gridCell.rocks,
        code: this.code
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
      console.log("evaling:");
      evalCode.call(context);
      console.log(context);
      this.oldDrawGridCell(gridCell, this.context);
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

  private expRand(exp: number = 2, scale: number = 1, min: number = 0.5) {
    const uniform = Math.random();
    const bp = Math.sin((uniform * Math.PI / 2));
    let result = Math.pow(bp, exp);
    result  = result < 0.5 ? 2 * result : 2 * (1 - result);
    result  = result * scale;
    result  = result <  min ? min : result;
    return result;
  }

  private randomRock() {
    const rockSize = this.expRand(10, 10, 1);
    const force = {
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50
    };
    const sizeV = rockSize;
    const windX = this.wind.x / sizeV;
    const windY = this.wind.y / sizeV;
    const randX = rand(200) / sizeV;
    const randY = rand(200) / sizeV;
    const x = randX + windX + force.x + this.center.x;
    const y = randY + windY + force.y + this.center.y;
    return new Rock({x, y}, rockSize);
  }

  private addRock() {
    const rock = this.randomRock();
    const x = Math.floor(rock.position.x / gridCellSize);
    const y = Math.floor(rock.position.y / gridCellSize);
    if ( y < 0 || x < 0 || x >= numCols || y >= numRows) {
      return;
    }
    const gridIndex = y * (canvasSize / gridCellSize) + x;
    const cell = this.gridCells[gridIndex];
    cell.addRock(rock);
  }

}
