import * as React from "react";
import { PixiComponent, Container, Text } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";
import { TextStyle } from "pixi.js";

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
        let lineColor = 0x7f7167;

        g.clear();
        if (!isPlaced) {
            lineColor = 0x686e77;
        }
        g.lineStyle(5, lineColor, 1);
        g.moveTo(crossPoint2X, crossPoint2Y);
        g.beginFill(lineColor, 1);
        g.drawCircle(crossPoint2X, crossPoint2Y, 11);
        g.endFill();
        g.moveTo(crossPoint2X, crossPoint2Y);
        g.lineTo(crossPoint1X, crossPoint1Y);
        g.beginFill(lineColor, 1);
        g.drawCircle(crossPoint1X, crossPoint1Y, 11);
        g.endFill();
    }
});

export class CrossSectionSelectorComponent extends React.Component<IProps, IState> {

    public render() {
        const { crossPoint2X, crossPoint2Y, crossPoint1X, crossPoint1Y, isPlaced } = this.props;

        const style = new TextStyle({fill: "white", fontSize: `12px`, align: "center"});

        return (
            <Container>
                <CrossSection
                    crossPoint2X={crossPoint2X}
                    crossPoint2Y={crossPoint2Y}
                    crossPoint1X={crossPoint1X}
                    crossPoint1Y={crossPoint1Y}
                    isPlaced={isPlaced} />
                <Text
                    anchor={[0.5, 0.5]}
                    text={"P1"}
                    x={crossPoint1X}
                    y={crossPoint1Y}
                    style={style}
                />
                <Text
                    anchor={[0.5, 0.5]}
                    text={"P2"}
                    x={crossPoint2X}
                    y={crossPoint2Y}
                    style={style}
                />
            </Container>
        );
    }
}
