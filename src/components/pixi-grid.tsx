import * as React from "react";

import { Container, PixiComponent } from "@inlet/react-pixi";
import { ICanvasShape } from "../interfaces";

interface IProps {
  gridMetrics: ICanvasShape;
}

interface IGridLineProps {
  start: {x: number, y: number};
  end: {x: number, y: number};
}

const GridLine = PixiComponent<IGridLineProps, PIXI.Graphics>("GridLine", {
  create: props => new PIXI.Graphics(),
  // didMount: (instance, parent) => {},
  // willUnmount: (instance, parent) => {},
  applyProps: (g, _: IGridLineProps, newProps: IGridLineProps) => {
    const { start, end} = newProps;
    g.alpha = 1;
    g.clear();
    g.moveTo(start.x, start.y);
    g.lineStyle(1.1, 0, 0.5, 0.5);
    g.lineTo(end.x, end.y);
    g.endFill();
  },
});

export const PixiGrid = (props: IProps) => {
  const { gridMetrics } = props;
  const { numCols, numRows, gridSize, height, width} = gridMetrics;
  const lines  = [];
  let x = 0;
  let y = 0;
  let start = null;
  let end = null;
  for (x = 0; x < numCols; x++) {
    start = {x: x * gridSize, y: 0};
    end = {x: x * gridSize, y: height};
    lines.push(<GridLine key={`x-gridline-${x}`} start={start} end={end} />);
  }
  x = 0;
  for (y = 0; y < numRows; y++) {
    start = {x: 0, y: y * gridSize};
    end =   {x: width, y: y * gridSize};
    lines.push(<GridLine key={`y-gridline-${y}`} start={start} end={end} />);
  }

  return (
    <Container>
      {lines}
    </Container>
  );
};
