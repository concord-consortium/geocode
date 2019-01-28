import Rock from "./rock";

const canvasSize = 500;
const fullCircle = Math.PI * 2;

const rand = (max: number) => Math.random() * max - (max / 2);

export default class Volcano {
  public wind = {
    x: rand(500),
    y: rand(500)
  };
  private context: CanvasRenderingContext2D | null;
  private hue = 100;
  private staturation = 50;
  private lightness = 50;
  private alpha = .5;
  private rocks: Rock[] = [];
  private center = {x: canvasSize / 2.0, y: canvasSize / 2.0};
  private baseMap: HTMLImageElement;

  constructor(element: HTMLCanvasElement|null) {
    this.baseMap = (document.getElementById("base-map") as HTMLImageElement);
    if (element !== null) {
      this.context = (element as HTMLCanvasElement).getContext("2d");
    }
  }

  public run() {
    console.log("running");
    this.randomizeWind();
    this.rocks = [];
    for (let i = 0; i < 400; i++) {
      this.addRock();
   }
    if (this.context) {
      this.context.clearRect(0, 0, canvasSize, canvasSize);
      this.rocks.forEach((rock) => {
        rock.draw(this.context as CanvasRenderingContext2D);
      });
      this.drawCaldera(this.context);
      this.drawBaseMap(this.context);
    }
  }
  private randomizeWind() {
    // this.wind.x += rand(50);
    // this.wind.y += rand(50);
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
    this.rocks.push(this.randomRock());
  }

  private colorString() {
    return `hsla(${this.hue}, ${this.staturation}%, ${this.lightness}%, ${this.alpha})`;
  }

}
