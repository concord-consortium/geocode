import * as React from "react";

import { PixiComponent, Text, Container } from "@inlet/react-pixi";
import { TextStyle } from "pixi.js";
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
  const { numCols, numRows, gridSize, height, width } = canvasMetrics;
  const getData = (x: number, y: number) => data[getGridIndexForLocation(x, y, numRows)];
  const cells = [];
  const maxTephra = 1;
  const numSegments = 200;
  const textSize = 12;

  const trueVolcanoX = ((volcanoX * gridSize) + 20) / gridSize;
  const trueVolcanoY = ((volcanoY * gridSize) + 20) / gridSize;
  const xDiff = (mouseX / gridSize) - trueVolcanoX;
  const yDiff = numRows - (mouseY / gridSize) - trueVolcanoY;
  const xSlope = xDiff / numSegments;
  const ySlope = yDiff / numSegments;
  const colWidth = (width - textSize - 2) / numSegments;

  for (let progress = 0; progress < numSegments; progress++) {
    const x = (progress / numSegments) * (width - textSize - 2);
    const xProgress = (trueVolcanoX + (xSlope * progress));
    const yProgress = (trueVolcanoY + (ySlope * progress));

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
    const thickness = maxTephra / Math.log10(simResults);

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
        x={x + textSize + 2}
        width={colWidth}
        maxHeight={height - textSize}
        height={thickness * (height - textSize)}/>
    );
  }

  const style = new TextStyle({fill: "black", fontSize: `${textSize}px`, align: "center"});
  const maxDist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

  return (
    <Container >
      {cells}
    <Text
      text="0"
      style={style}
      x={textSize / 2}
      y={height - textSize}
    />
    <Text
      text="Distance from vent (km)"
      style={style}
      anchor={[0.5, 0]}
      x={width / 2}
      y={height - textSize}
      />
    <Text
      text="Tephra thickness (mm)"
      style={style}
      rotation={3 * Math.PI / 2}
      x={0}
      y={height - textSize}
      />
    <Text
      text={maxDist.toFixed(2) + "km"}
      style={style}
      anchor={[1, 0]}
      x={width}
      y={height - textSize}
    />
    </Container>
  );
};
