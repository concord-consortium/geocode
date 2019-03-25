import gridTephraCalc from "./tephra2";
import { simulation } from "./models/volcano-store";
import { evalCode } from "./utilities/interpreter";
const canvasSize = 500;
const gridCellSize = 20;

const numRows = canvasSize / gridCellSize;
const numCols = numRows;
const VOLCANO_CENTER = { x: numCols / 2 - 0.5, y: numRows / 2 - 0.5};

const rand = (max: number) => Math.random() * max - (max / 2);

const makeHSLA = (h: number, s: number, l: number, a: number) => {
  return `hsla(${h * 2.5}, ${s}%, ${l}%, ${a && a / 100})`;
};

export default class Volcano {
  private context: CanvasRenderingContext2D | null;
  private gridCells: number[] = [];
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
        const thickness = gridTephraCalc(
          x, y, VOLCANO_CENTER.x, VOLCANO_CENTER.y,
          simulation.windSpeed,
          simulation.colHeight,
          simulation.mass,
          simulation.particleSize
        );
        this.gridCells.push(thickness);
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
   evalCode(code);
  }

  private drawGridCell(x: number, y: number, thickness: number) {
    const fillGridCell = (h: number, s: number, l: number, a: number) => {
      if (this.context) {
        this.context.fillStyle = makeHSLA(h, s, l, a);
        this.context.fillRect(0, 0, gridCellSize - 1, gridCellSize - 1);
      }
    };
    if (this.context) {
      this.context.save();
      this.context.translate(x * gridCellSize, y * gridCellSize);
      fillGridCell(0, 0.5, 0.5, thickness);
      // evalCode({
      //   x,
      //   y,
      //   thickness,
      //   context: this.context,
      //   fill: fillGridCell,
      //   setModelParams: () => null
      // });

      this.context.restore();
    }
  }

  private drawGridCells() {
    this.gridCells.forEach((gridCell, index) => {
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
