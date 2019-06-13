import * as React from "react";
import { Container, Text } from "@inlet/react-pixi";
import { TextStyle } from "pixi.js";
import { Ipoint } from "../interfaces";

export const GridLabel = (props: {position: Ipoint, title: string, xAxis: boolean, size: number}) => {
    const style = new TextStyle({fill: "black", fontSize: "12px", align: "center"});
    const { position, size, title, xAxis } = props;
    const x = position.x * size + (xAxis ? size / 2 : size / 2);
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
