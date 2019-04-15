import * as React from "react";

import { Container, Text } from "@inlet/react-pixi";
import { TextStyle } from "pixi.js";
import { ICanvasShape, Ipoint } from "../interfaces";

interface IProps {
  gridMetrics: ICanvasShape;
}

const GridLabel = (props: {position: Ipoint, title: string, xAxis: boolean, size: number}) => {
  const style = new TextStyle({fill: "black", fontSize: "12px", align: "center"});
  const { position, size, title, xAxis } = props;
  const x = position.x * size + (xAxis ? size / 2 : 0);
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

export const PixiAxis = (props: IProps) => {
  const { gridMetrics } = props;
  const { numCols, numRows, gridSize} = gridMetrics;
  const labels  = [];
  let x = 0;
  let y = 0;
  for (x = 0; x < numCols; x++) {
    labels.push(<GridLabel xAxis={true} position={{x, y}} size={gridSize} title={`${x}`} />);
  }
  x = 0;
  for (y = 0; y < numRows; y++) {
    labels.push(<GridLabel xAxis={false} position={{x, y}} size={gridSize} title={`${y}`}/>);
  }

  return (
    <Container>
      {labels}
    </Container>
  );
};
