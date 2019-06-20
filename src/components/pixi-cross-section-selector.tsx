import * as React from "react";
import { PixiComponent, Container } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";

interface IProps {
    crossPoint1X: number;
    crossPoint1Y: number;
    crossPoint2X: number;
    crossPoint2Y: number;
    isPlaced: boolean;
}

interface IState {

}

export const CrossSection = PixiComponent<IProps, PIXI.Graphics>("CrossSection", {
    create: (props) => new PIXI.Graphics(),
    applyProps: (g, _, props: IProps) => {
        const { crossPoint2X, crossPoint2Y, crossPoint1X, crossPoint1Y, isPlaced } = props;
        let lineColor = 0x624d6b;

        g.clear();
        if (!isPlaced) {
            lineColor = 0xd0aae0;
        }
        g.lineStyle(3, lineColor, 1);
        g.moveTo(crossPoint2X, crossPoint2Y);
        g.beginFill(lineColor, 1);
        g.drawCircle(crossPoint2X, crossPoint2Y, 5);
        g.endFill();
        g.moveTo(crossPoint2X, crossPoint2Y);
        g.lineTo(crossPoint1X, crossPoint1Y);
        g.beginFill(lineColor, 1);
        g.drawCircle(crossPoint1X, crossPoint1Y, 5);
        g.endFill();
    }
});

export class CrossSectionSelectorComponent extends React.Component<IProps, IState> {

    public render() {
        const { crossPoint2X, crossPoint2Y, crossPoint1X, crossPoint1Y, isPlaced } = this.props;
        return (
            <Container>
                <CrossSection
                    crossPoint2X={crossPoint2X}
                    crossPoint2Y={crossPoint2Y}
                    crossPoint1X={crossPoint1X}
                    crossPoint1Y={crossPoint1Y}
                    isPlaced={isPlaced} />
            </Container>
        );
    }
}
