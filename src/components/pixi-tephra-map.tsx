import * as React from "react";

import { Container, Text } from "@inlet/react-pixi";
import { TextStyle } from "pixi.js";
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

// This was copied from pixi-axis and is unmodified
// Moving it to a separate location for both to use would reduce redundant code -Saul
const GridLabel = (props: {position: Ipoint, title: string, xAxis: boolean, size: number}) => {
  const style = new TextStyle({fill: "black", fontSize: "12px", align: "center"});
  const { position, size, title, xAxis } = props;
  const x = position.x * size + (xAxis ? size / 2 : size / 2);
  const y = position.y * size + size / 2;
  return (
    <Container position={[x, y]} >
      {
        xAxis
        ? <Text anchor={[0.5, 0]} style={style} text={title}/>
        : <Text anchor={[0.0, 0.5]} style={style} text={title}/>
      }

    </Container>
  );
};

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
