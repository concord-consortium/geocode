
export interface ICanvasShape {
  width: number;
  height: number;
  numCols: number;
  numRows: number;
  gridSize: number;
}
export interface IBlocklyWorkspace {
  highlightBlock: (id: number) => void;
}
export interface Ipoint {
  x: number;
  y: number;
}
