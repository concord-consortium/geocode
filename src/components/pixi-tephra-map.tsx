import * as React from "react";

import { Container } from "@inlet/react-pixi";
import { PixiComponent } from "@inlet/react-pixi";
import { ICanvasShape } from "../canvas-grid";
import * as PIXI from "pixi.js";
import * as Color from "color";

interface IProps {
  canvasMetrics: ICanvasShape;
  data: number[];
}

interface IHsla {
  hue: number;
  sat: number;
  value: number;
  alpha: number;
}
interface IGridSquareProps {
  hsla: IHsla;
  x: number;
  y: number;
  size: number;
}

const GridSquare =  PixiComponent<IGridSquareProps, PIXI.Graphics>("GridSquare", {
  create: props => new PIXI.Graphics(),
  // didMount: (instance, parent) => {},
  // willUnmount: (instance, parent) => {},
  applyProps: (g, _: IGridSquareProps, newProps: IGridSquareProps) => {
    const { hsla, x, y, size} = newProps;
    g.clear();
    g.alpha = hsla.alpha;
    const colorString = `hsl(${hsla.hue}, ${hsla.sat}%, ${hsla.value}%)`;
    const fillRGB = Color(colorString).rgbNumber();
    g.beginFill(fillRGB);
    g.drawRect(x, y, size, size);
    g.endFill();
  },
});

export const PixiTephraMap = (props: IProps) => {
  const { canvasMetrics, data } = props;
  const { numCols, numRows, gridSize } = canvasMetrics;
  const getData = (x: number, y: number) => data[x + y * numCols];
  const cells = [];
  for (let gridX = 0; gridX < numCols; gridX++) {
    for (let gridY = 0; gridY < numRows; gridY++) {
      const offset = gridSize / 2;
      const x = gridSize * gridX + offset;
      const y = gridSize * gridY + offset;
      const hsla: IHsla = {
        hue: 0,
        sat: 50,
        value: 50,
        alpha: getData(gridX, gridY)
      };
      cells.push(<GridSquare hsla={hsla} x={x} y={y} size={gridSize} />);
    }
  }
  return (
    <Container >
      {cells}
    </Container>
  );
};
