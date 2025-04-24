import * as React from "react";

import { PixiComponent, Text, Container } from "@pixi/react";
import { TextStyle } from "pixi.js";
import { ICanvasShape } from "../../interfaces";
import * as PIXI from "pixi.js";
import * as Color from "color";
import * as L from "leaflet";
import gridTephraCalc from "../../tephra2";
import { LatLngToLocal, getDistanceFromLatLonInKm } from "../../utilities/coordinateSpaceConversion";

interface IProps {
  canvasMetrics: ICanvasShape;
  volcanoLat: number;
  volcanoLng: number;
  crossPoint1Lat: number;
  crossPoint1Lng: number;
  crossPoint2Lat: number;
  crossPoint2Lng: number;
  windSpeed: number;
  windDirection: number;
  colHeight: number;
  mass: number;
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
  const {
    canvasMetrics,
    volcanoLat,
    volcanoLng,
    crossPoint1Lat,
    crossPoint1Lng,
    crossPoint2Lat,
    crossPoint2Lng,
    windSpeed,
    windDirection,
    colHeight,
    mass
  } = props;
  const { height, width } = canvasMetrics;
  const cells = [];
  const maxTephra = 1;
  const numSegments = 150;
  const textSize = 12;

  const localPosPoint1 = LatLngToLocal(L.latLng(crossPoint1Lat, crossPoint1Lng), L.latLng(volcanoLat, volcanoLng));
  const localPosPoint2 = LatLngToLocal(L.latLng(crossPoint2Lat, crossPoint2Lng), L.latLng(volcanoLat, volcanoLng));

  const trueP1X = localPosPoint1.x;
  const trueP1Y = localPosPoint1.y;
  const xDiff = localPosPoint2.x - trueP1X;
  const yDiff = localPosPoint2.y - trueP1Y;
  const xSlope = xDiff / numSegments;
  const ySlope = yDiff / numSegments;
  const colWidth = (width - textSize - 2) / numSegments;

  for (let progress = 0; progress < numSegments; progress++) {
    const x = (progress / numSegments) * (width - textSize - 2);
    const xProgress = (trueP1X + (xSlope * progress));
    const yProgress = (trueP1Y + (ySlope * progress));

    const vX = 0;
    const vY = 0;
    const simResults = gridTephraCalc(
      xProgress, yProgress, vX, vY,
      windSpeed,
      windDirection,
      colHeight,
      mass
    );

    // Add 10 to the calculation so that the return of the log is between 0 and 1
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
  const maxDist = getDistanceFromLatLonInKm(
                    L.latLng(crossPoint1Lat, crossPoint1Lng),
                    L.latLng(crossPoint2Lat, crossPoint2Lng));

  return (
    <Container>
      {cells}
    <Text
      text="0"
      style={style}
      x={textSize / 2}
      y={height - textSize}
    />
    <Text
      text="Distance (km)"
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
