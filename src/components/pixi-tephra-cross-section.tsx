import * as React from "react";

import { Container } from "@inlet/react-pixi";
import { PixiComponent } from "@inlet/react-pixi";
import { ICanvasShape } from "../interfaces";
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

interface IBarProps {
  hsla: IHsla;
  x: number;
  width: number;
  height: number;
  maxHeight: number;
}

const Bar =  PixiComponent<IBarProps, PIXI.Graphics>("Bar", {
  create: props => new PIXI.Graphics(),
  // didMount: (instance, parent) => {},
  // willUnmount: (instance, parent) => {},
  applyProps: (g, _: IBarProps, newProps: IBarProps) => {
    const { hsla, x, width, height, maxHeight} = newProps;
    g.alpha = 1;
    g.clear();
    g.alpha = hsla.alpha;
    const colorString = `hsl(${hsla.hue}, ${hsla.sat}%, ${hsla.value}%)`;
    const fillRGB = Color(colorString).rgbNumber();
    g.beginFill(fillRGB);
    g.drawRect(x, height, width, maxHeight - height);
    g.endFill();
  },
});

export const PixiTephraCrossSection = (props: IProps) => {
  const { canvasMetrics, data } = props;
  const { numCols, numRows, gridSize, height } = canvasMetrics;
  const getData = (x: number, y: number) => data[y + x * numRows];
  const cells = [];
  const maxTephra = 1;
  for (let gridX = 0; gridX < numCols; gridX++) {
    const x = gridSize * gridX;
    let thickness = 0;
    for (let gridY = 0; gridY <  numRows; gridY++) {
      thickness = Math.max(getData(gridX, gridY), thickness);
    }
    // thickness = thickness / numRows;
    const tephHeight = maxTephra / thickness;
    const hsla: IHsla = {
      hue: 10,
      sat: 40,
      value: 60,
      alpha: 1 - tephHeight
    };
    cells.push(
      <Bar
        key={`cross-section-bar-${x}`}
        hsla={hsla}
        x={x}
        width={gridSize}
        maxHeight={height}
        height={tephHeight * height}
      />);
  }
  return (
    <Container >
      {cells}
    </Container>
  );
};
