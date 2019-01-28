const fullCircle = Math.PI * 2;

export interface IPosition {
  x: number;
  y: number;
}

export default class Rock {

  private context: CanvasRenderingContext2D;
  private hue = 0;
  private staturation = 50;
  private lightness = 50;
  private alpha = .5;
  private position = {x: 0, y: 0};
  private velocity = {x: 0, y: 0};
  private size = 0;

  constructor(position: IPosition, size = 0, velocity: IPosition = {x: 0, y: 0}) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
  }

  public draw(context: CanvasRenderingContext2D) {
    const {x, y} = this.position;
    // const size = this.size;
    const size = 30;
    const alignX = x - x % size;
    const alignY = y - y % size;
    context.fillStyle = this.colorString();
    context.fillRect(alignX, alignY, size, size);
    // context.beginPath();

    // context.ellipse(alignX, alignY, size, size, 0, 0, fullCircle);
    // context.fill();
  }

  private colorString() {
    const alpha = this.size / 20;
    return `hsla(${this.hue}, ${this.staturation}%, ${this.lightness}%, ${alpha})`;
  }

}
