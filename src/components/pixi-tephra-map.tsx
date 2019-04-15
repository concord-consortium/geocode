import * as React from "react";

import { Container } from "@inlet/react-pixi";
import { PixiComponent } from "@inlet/react-pixi";
import { ICanvasShape, Ipoint } from "../interfaces";
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
  position: Ipoint;
  size: number;
}

const GridSquare =  PixiComponent<IGridSquareProps, PIXI.Graphics>("GridSquare", {
  create: props => new PIXI.Graphics(),
  // didMount: (instance, parent) => {},
  // willUnmount: (instance, parent) => {},
  applyProps: (g, _: IGridSquareProps, newProps: IGridSquareProps) => {
    const { hsla, position, size} = newProps;
    const x = position.x * size;
    const y = position.y * size;
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
      const hsla: IHsla = {
        hue: 10,
        sat: 40,
        value: 60,
        alpha: getData(gridX, gridY)
      };
      cells.push(<GridSquare hsla={hsla} position={{x: gridX, y: gridY}} size={gridSize} />);
    }
  }
  return (
    <Container >
      {cells}
    </Container>
  );
};
