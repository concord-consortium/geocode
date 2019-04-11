import * as React from "react";

import { Container, Text } from "@inlet/react-pixi";
import { TextStyle } from "pixi.js";
import { ICanvasShape } from "../interfaces";
import * as Color from "color";

interface IProps {
  gridMetrics: ICanvasShape;
}

const GridLabel = (props: {x: number, y: number, title: string, top: boolean}) => {
  const style = new TextStyle({fill: "black", fontSize: "12px", align: "center"});
  const { x, y, title, top } = props;

  return (
    <Container position={[x, y]} >
      {
        top
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
  const offset = gridSize / 2;
  let x = 0;
  let y = 0;
  for (x = 0; x < numCols; x++) {
    labels.push(<GridLabel top={true} x={x * gridSize + offset} y={0} title={`${x}`} />);
  }
  x = 0;
  for (y = 0; y < numRows; y++) {
    labels.push(<GridLabel top={false} x={0} y={y * gridSize + offset} title={`${y}`}/>);
  }

  return (
    <Container>
      {labels}
    </Container>
  );
};
