const fullCircle = Math.PI * 2;

export interface IPosition {
  x: number;
  y: number;
}

export default class Rock {
  public position = {x: 0, y: 0};
  public size = 0;

  constructor(position: IPosition, size = 0) {
    this.position = position;
    this.size = size;
  }

}
