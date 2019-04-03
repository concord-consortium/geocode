import { CanvasGrid, ICanvasShape } from "./canvas-grid";
import { CityType } from "./stores/volcano-store";

export class CanvasCities extends CanvasGrid {
  protected cities: CityType[];
  protected code: string;

  constructor(ctx: CanvasRenderingContext2D, geometry: ICanvasShape, cities: CityType[]) {
    super(ctx, geometry);
    this.cities = cities;
  }

  public draw() {
    // this.clear();
    this.drawCities();
  }

  private drawCity(city: CityType) {
    const { x, y, name} = city;
    const { gridSize } = this.geometry;
    const fontSize = 12;
    const textBoxMargin = 2;
    const ctx = this.context;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const metrics = ctx.measureText(name);
    const width = metrics.width + 2 * textBoxMargin;
    const height = fontSize + textBoxMargin;
    const starFill = this.makeHSLA(100, 40, 40, 100);
    const textBoxFill = this.makeHSLA(100, 0, 100, 90);
    const nameFill = this.makeHSLA(0, 0, 10, 100);
    const offsetY = Math.floor(gridSize / 2);
    const offsetX = offsetY;

    this.drawInCell(x, y, (c) => {
      c.fillStyle = starFill;
      c.fillText("★", offsetX, offsetY);
      c.fillStyle = textBoxFill;
      c.fillRect(offsetX - (width / 2), offsetY + height - (height / 2), width, height);
      c.fillStyle = nameFill;
      c.fillText(name, offsetX, offsetY + height);
    });
  }

  private drawCities() {
    this.cities.forEach((city) => {
      this.drawCity(city);
    });
  }

}
