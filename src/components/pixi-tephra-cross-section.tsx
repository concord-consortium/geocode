import * as React from "react";

import { Container } from "@inlet/react-pixi";
import { PixiComponent } from "@inlet/react-pixi";
import { ICanvasShape } from "../interfaces";
import * as PIXI from "pixi.js";
import * as Color from "color";
import { getGridIndexForLocation } from "../stores/simulation-store";
import gridTephraCalc from "../tephra2";


interface IProps {
  canvasMetrics: ICanvasShape;
  data: number[];
  volcanoX: number;
  volcanoY: number;
  mouseX: number;
  mouseY: number;
  windSpeed: number;
  windDirection: number;
  colHeight: number;
  mass: number;
  particleSize: number;
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
  const { canvasMetrics, data, volcanoX, volcanoY, mouseX, mouseY,
          windSpeed, windDirection, colHeight, mass, particleSize } = props;
  const { numCols, numRows, gridSize, height } = canvasMetrics;
  const getData = (x: number, y: number) => data[getGridIndexForLocation(x, y, numRows)];
  const cells = [];
  const maxTephra = 1;

  // const xDiff = (mouseX - (volcanoX * gridSize) + 20) / gridSize;
  // const yDiff = numRows - (mouseY - (volcanoY * gridSize) + 20) / gridSize;
  const trueVolcanoX = ((volcanoX * gridSize) + 20) / gridSize;
  const trueVolcanoY = ((volcanoY * gridSize) + 20) / gridSize;
  const xDiff = (mouseX / gridSize) - trueVolcanoX;
  const yDiff = numRows - (mouseY / gridSize) - trueVolcanoY;
  const numSegments = 500;
  const xSlope = xDiff / numSegments;
  const ySlope = yDiff / numSegments;
  const width = gridSize * numCols / numSegments;

  for (let progress = 0; progress < numSegments; progress++) {
    const x = (progress / numSegments) * gridSize * numCols;
    const xProgress = (trueVolcanoX + (xSlope * progress));
    const yProgress = (trueVolcanoY + (ySlope * progress));
    // const thickness = maxTephra / getData(xProgress, yProgress);

    const rows = numRows;
    const cols = numCols;
    const vX = volcanoX;
    const vY = volcanoY;
    const simResults = gridTephraCalc(
      xProgress, yProgress, vX, vY,
      windSpeed,
      windDirection,
      colHeight,
      mass,
      particleSize
    );
    const thickness = maxTephra / simResults;

    const hsla: IHsla = {
      hue: 10,
      sat: 40,
      value: 60,
      alpha: 1 - thickness
    };

    cells.push(
      <Bar
        key={`cross-section-bar-${x}`}
        hsla={hsla}
        x={x}
        width={width}
        maxHeight={height}
        height={thickness * height}/>
    );
  }
  return (
    <Container >
      {cells}
    </Container>
  );
};
