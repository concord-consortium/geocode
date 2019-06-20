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
  crossPoint1X: number;
  crossPoint1Y: number;
  crossPoint2X: number;
  crossPoint2Y: number;
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
  const { canvasMetrics, data, volcanoX, volcanoY, crossPoint1X, crossPoint1Y, crossPoint2X, crossPoint2Y,
          windSpeed, windDirection, colHeight, mass, particleSize } = props;
  const { numCols, numRows, gridSize, height, width } = canvasMetrics;
  const getData = (x: number, y: number) => data[getGridIndexForLocation(x, y, numRows)];
  const cells = [];
  const maxTephra = 1;
  const numSegments = 200;
  const textSize = 12;

  const trueP1X = ((crossPoint1X) / gridSize);
  const trueP1Y = numRows - ((crossPoint1Y) / gridSize);
  const xDiff = (crossPoint2X / gridSize)  - trueP1X;
  const yDiff = (numRows - (crossPoint2Y / gridSize) - trueP1Y);
  const xSlope = xDiff / numSegments;
  const ySlope = yDiff / numSegments;
  const colWidth = (width - textSize - 2) / numSegments;

  for (let progress = 0; progress < numSegments; progress++) {
    const x = (progress / numSegments) * (width - textSize - 2);
    const xProgress = (trueP1X + (xSlope * progress));
    const yProgress = (trueP1Y + (ySlope * progress));

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

    // I add 10 to the calculation so that the return of the log is between 0 and 1
    const thickness = maxTephra / Math.log10(simResults + 10);

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
