import * as React from "react";

import { Container, PixiComponent } from "@inlet/react-pixi";
import { Ipoint } from "../interfaces";

interface IParticleSizeWidgetProps {
    particleSize: number;
    location: Ipoint;
}

const sizeToRadiusRatio = 0.3;

const Circle = PixiComponent<IParticleSizeWidgetProps, PIXI.Graphics>("ParticleSizeWidget", {
    create: props => new PIXI.Graphics(),

    applyProps: (g, _: IParticleSizeWidgetProps, newProps: IParticleSizeWidgetProps) => {
        const { particleSize } = newProps;
        const circleRadius = particleSize * sizeToRadiusRatio;
        g.alpha = 1;
        g.clear();
        g.moveTo(0, 0);
        g.beginFill(0);
        g.lineStyle(1, 0);
        g.drawCircle(0, 0, circleRadius + 2);
        g.endFill();
    }
});

export const ParticleSizeWidget = (props: IParticleSizeWidgetProps) => {
    const { location } = props;
    const {x, y} = location;

    return (
        <Container cacheAsBitmap={false} x={x} y={y}>
            <Circle {...props} />
        </Container>
    );
};
