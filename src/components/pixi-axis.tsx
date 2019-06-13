import * as React from "react";

import { Container } from "@inlet/react-pixi";
import { GridLabel } from "./grid-label-component";
import { ICanvasShape, Ipoint } from "../interfaces";

interface IProps {
  gridMetrics: ICanvasShape;
  toCanvasCoords: (point: Ipoint) => Ipoint;
}

export const PixiAxis = (props: IProps) => {
  const { gridMetrics, toCanvasCoords } = props;
  const { numCols, numRows, gridSize} = gridMetrics;
  const labels  = [];
  let x = 0;
  let y = 0;
  for (x = 0; x < numCols; x++) {
    labels.push(
      <GridLabel
        key={`x:${x}`}
        xAxis={true}
        position={toCanvasCoords({x, y})}
        size={gridSize} title={`${x}`}
      />);
  }
  x = 0;
  for (y = 1; y < numRows; y++) {
    labels.push(
      <GridLabel
        key={`y:${y}`}
        xAxis={false}
        position={toCanvasCoords({x, y})}
        size={gridSize}
        title={`${y}`}
      />);
  }

  return (
    <Container>
      {labels}
    </Container>
  );
};
