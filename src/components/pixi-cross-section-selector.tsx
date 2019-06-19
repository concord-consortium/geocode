import * as React from "react";
import { PixiComponent, Container } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";

interface IProps {
    volcanoX: number;
    volcanoY: number;
    mouseX: number;
    mouseY: number;
    isPlaced: boolean;
}

interface IState {

}

export const CrossSection = PixiComponent<IProps, PIXI.Graphics>("CrossSection", {
    create: (props) => new PIXI.Graphics(),
    applyProps: (g, _, props: IProps) => {
        const { volcanoX, volcanoY, mouseX, mouseY, isPlaced } = props;
        let lineColor = 0x624d6b;

        g.clear();
        if (!isPlaced) {
            lineColor = 0xd0aae0;
        }
        g.lineStyle(3, lineColor, 1);
        g.moveTo(volcanoX, volcanoY);
        g.beginFill(lineColor, 1);
        g.drawCircle(volcanoX, volcanoY, 5);
        g.endFill();
        g.moveTo(volcanoX, volcanoY);
        g.lineTo(mouseX, mouseY);
        g.beginFill(lineColor, 1);
        g.drawCircle(mouseX, mouseY, 5);
        g.endFill();
    }
});

export class CrossSectionSelectorComponent extends React.Component<IProps, IState> {

    public render() {
        const { volcanoX, volcanoY, mouseX, mouseY, isPlaced } = this.props;
        return (
            <Container>
                <CrossSection
                    volcanoX={volcanoX}
                    volcanoY={volcanoY}
                    mouseX={mouseX}
                    mouseY={mouseY}
                    isPlaced={isPlaced} />
            </Container>
        );
    }
}
