import * as React from "react";

import { Container, PixiComponent } from "@inlet/react-pixi";
import { Ipoint } from "../interfaces";

interface IWindWidgetProps {
  windDirection: number;
  windSpeed: number;
  location: Ipoint;
}

const arrowheadRadius = 6;
const arrowOffset = arrowheadRadius / 2;
const speedToLengthRatio = 2;

const Arrow = PixiComponent<IWindWidgetProps, PIXI.Graphics>("WindWidget", {
  create: props => new PIXI.Graphics(),
  // didMount: (instance, parent) => {},
  // willUnmount: (instance, parent) => {},
  applyProps: (g, _: IWindWidgetProps, newProps: IWindWidgetProps) => {
    const { windSpeed } = newProps;
    const length = windSpeed * speedToLengthRatio;
    const lineEnd = 0 - length;
    const headCenter = lineEnd - arrowOffset;
    g.alpha = 1;
    g.clear();
    g.moveTo(0, 0);
    g.lineStyle(1, 0);
    g.lineTo(0, lineEnd);
    g.lineStyle(0, 0);
    g.beginFill(0, 1);
    g.drawStar(0, headCenter, 3, arrowheadRadius, 0, 0);
    g.endFill();
  }
});

export const WindWidget = (props: IWindWidgetProps) => {
  const { windDirection: angleDegrees, location } = props;
  const arrowDirection = 360 - angleDegrees;
  const {x, y} = location;
  return (
    <Container cacheAsBitmap={false} x={x} y={y} rotation={arrowDirection / 360 * Math.PI * 2}>
      <Arrow {...props} />
    </Container>
  );
};
