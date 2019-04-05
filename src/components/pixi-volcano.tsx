
import { PixiComponent } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";
import * as Color from "color";

interface IVolcProps {
  gridX: number;
  gridY: number;
  gridSize: number;
}

export default PixiComponent<IVolcProps, PIXI.Graphics>("Volcano", {
  create: (props) => new PIXI.Graphics(),
  applyProps: (g, _, props: IVolcProps) => {
    const rgbFill = Color("hsl(10, 20%, 50%)").rgbNumber();
    const { gridX, gridY, gridSize } = props;
    const scale = 0.5 * gridSize;
    const x = gridX * gridSize;
    const y = gridY * gridSize;
    const half = Math.floor(scale / 2);

    const top = y - half;
    const bottom = y + half;
    const right = x + half;
    const left =  x - half;
    const center = x + 0;

    const volcanoPoints = [
      center, top,
      right, bottom,
      left, bottom
    ];

    g.clear();
    g.beginFill(rgbFill);
    g.drawPolygon(volcanoPoints);
    g.endFill();
  }
});
