import * as React from "react";

import { Container } from "@inlet/react-pixi";
import { PixiComponent } from "@inlet/react-pixi";
import { ICanvasShape, Ipoint } from "../interfaces";
import * as PIXI from "pixi.js";
import * as Color from "color";

interface IProps {
  canvasMetrics: ICanvasShape;
  gridColors: string[];
  toCanvasCoords: (point: Ipoint) => Ipoint;
}

interface IGridSquareProps {
  color: string;
  position: Ipoint;
  size: number;
}

const GridSquare =  PixiComponent<IGridSquareProps, PIXI.Graphics>("GridSquare", {
  create: props => new PIXI.Graphics(),
  // didMount: (instance, parent) => {},
  // willUnmount: (instance, parent) => {},
  applyProps: (g, _: IGridSquareProps, newProps: IGridSquareProps) => {
    const { color, position, size} = newProps;
    const x = position.x * size;
    const y = position.y * size;
    g.clear();
    const fillColor = Color(color);
    const fillRGB = fillColor.rgbNumber();
    g.beginFill(fillRGB, fillColor.alpha());
    g.drawRect(x, y, size, size);
    g.endFill();
  },
});

export const PixiTephraMap = (props: IProps) => {
  const { canvasMetrics, gridColors, toCanvasCoords } = props;
  const { numCols, numRows, gridSize } = canvasMetrics;
  const getColor = (x: number, y: number) =>
    gridColors[x + y * numCols] || "hsla(0, 0%, 100%, 0)";
  const cells = [];
  for (let gridX = 0; gridX < numCols; gridX++) {
    for (let gridY = 0; gridY < numRows; gridY++) {
      const color = getColor(gridX, gridY);
      cells.push(
        <GridSquare
          color={color}
          key={`${gridX}-${gridY}`}
          position={toCanvasCoords({x: gridX, y: gridY})}
          size={gridSize}
        />);
    }
  }
  return (
    <Container >
      {cells}
    </Container>
  );
};
