import * as React from "react";
import { Text } from "@inlet/react-pixi";

import { Container, PixiComponent } from "@inlet/react-pixi";
import { Ipoint } from "../interfaces";

const style = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 12,
});

interface ISidebarDataDisplayProps {
    vei: number;
    colHeight: number;
    mass: number;
    particleSize: number;
    location: Ipoint;
}

export const SidebarDataDisplay = (props: ISidebarDataDisplayProps) => {
    const { location, vei, colHeight, mass, particleSize } = props;
    const {x, y} = location;

    return (
        <Container>
            <Text x={x} y={y} style={style} text={"VEI: " + vei} />
            <Text x={x} y={y + 20} style={style} text={"Column Height: " + colHeight + "km"} />
            <Text x={x} y={y + 40} style={style} text={"Mass: " + mass + "kg"} />
            <Text x={x} y={y + 60} style={style} text={"Particle Size: " + particleSize + "mm"} />
        </Container>
    );
};
