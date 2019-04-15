
import { PixiComponent } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";
import * as Color from "color";
import { Ipoint } from "../interfaces";

interface IVolcProps {
  position: Ipoint;
  gridSize: number;
}

export default PixiComponent<IVolcProps, PIXI.Graphics>("Volcano", {
  create: (props) => new PIXI.Graphics(),
  applyProps: (g, _, props: IVolcProps) => {
    const rgbFill = Color("hsl(10, 20%, 50%)").rgbNumber();
    const { position, gridSize } = props;
    const scale = gridSize;
    const x = position.x * gridSize;
    const y = position.y * gridSize;
    const half = Math.floor(scale / 2);

    const top = y;
    const bottom = y + gridSize;
    const right = x + gridSize;
    const left =  x;
    const center = x + half;

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
