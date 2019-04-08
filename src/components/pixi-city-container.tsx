import * as React from "react";

import styled from "styled-components";
import { Container, Text } from "@inlet/react-pixi";
import { TextStyle } from "pixi.js";
import * as Color from "color";

interface IProps {
  position: {x: number, y: number};
  name: string;
  gridSize: number;
}

const CityLabel = (props: {title: string}) => {
  const style = new TextStyle({fill: "black", fontSize: "12px"});
  return (
    <Text style={style} text={props.title}/>
  );
};

export const PixiCityContainer = (props: IProps) => {
  const { name, position, gridSize } = props;
  const { x, y } = position;
  return (
    <Container position={[x * gridSize, y * gridSize]} >
        <CityLabel title={name} />
    </Container>
  );
};
