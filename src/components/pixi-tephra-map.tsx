import * as React from "react";

import { Container } from "@inlet/react-pixi";
import { GridLabel } from "./grid-label-component";
import { PixiComponent } from "@inlet/react-pixi";
import { ICanvasShape, Ipoint } from "../interfaces";
import * as PIXI from "pixi.js";
import * as Color from "color";
import { getGridIndexForLocation } from "../stores/simulation-store";

interface IProps {
  canvasMetrics: ICanvasShape;
  gridColors: string[];
  gridValues: string[];
  toCanvasCoords: (point: Ipoint) => Ipoint;
}

interface IGridSquareProps {
  color: string;
  value: string;
  position: Ipoint;
  size: number;
}

const GridSquare =  PixiComponent<IGridSquareProps, PIXI.Graphics>("GridSquare", {
  create: props => new PIXI.Graphics(),
  // didMount: (instance, parent) => {},
  // willUnmount: (instance, parent) => {},
  applyProps: (g, _: IGridSquareProps, newProps: IGridSquareProps) => {
    const { color, value, position, size} = newProps;
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
  const { canvasMetrics, gridColors, gridValues, toCanvasCoords } = props;
  const { numCols, numRows, gridSize } = canvasMetrics;
  const getColor = (x: number, y: number) =>
    gridColors[getGridIndexForLocation(x, y, numRows)] || "hsla(0, 0%, 100%, 0)";
  const getValue = (x: number, y: number) =>
    gridValues[getGridIndexForLocation(x, y, numRows)] || "";
  const cells = [];
  for (let gridX = 0; gridX < numCols; gridX++) {
    for (let gridY = 0; gridY < numRows; gridY++) {
      const color = getColor(gridX, gridY);
      const value = getValue(gridX, gridY);
      cells.push(
        <GridSquare
          color={color}
          value={value}
          key={`${gridX}-${gridY}`}
          position={toCanvasCoords({x: gridX, y: gridY})}
          size={gridSize}
        />);
      cells.push(
        <GridLabel
          position={toCanvasCoords({x: gridX, y: gridY})}
          title={value}
          xAxis={true}
          size={gridSize}
        />
      );
    }
  }
  return (
    <Container >
      {cells}
    </Container>
  );
};
