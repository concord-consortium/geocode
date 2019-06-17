import * as React from "react";
import { PixiComponent } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";

interface IProps {
    volcanoX: number;
    volcanoY: number;
    mouseX: number;
    mouseY: number;
}

interface IState {

}

export const CrossSection = PixiComponent<IProps, PIXI.Graphics>("CrossSection", {
    create: (props) => new PIXI.Graphics(),
    applyProps: (g, _, props: IProps) => {
        const { volcanoX, volcanoY, mouseX, mouseY } = props;

        // console.log(mouseX + " " + mouseY);
        g.clear();
        g.lineStyle(3, 0, 1);
        g.moveTo(volcanoX, volcanoY);

        g.lineTo(mouseX, mouseY);

    }
});

export class CrossSectionSelectorComponent extends React.Component<IProps, IState> {

    public render() {
        const { volcanoX, volcanoY, mouseX, mouseY } = this.props;
        return (
            <CrossSection
                volcanoX={volcanoX}
                volcanoY={volcanoY}
                mouseX={mouseX}
                mouseY={mouseY} />
        );
    }
}
