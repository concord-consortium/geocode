import { Container, PixiComponent } from "@pixi/react";
import PIXI from "pixi.js";
import { Ipoint } from "../../interfaces";

interface IColumnHeightWidgetProps {
    colHeight: number;
    location: Ipoint;
}

const arrowheadRadius = 6;
const arrowOffset = arrowheadRadius / 2;
const heightToLengthRatio = 0.0018;
const mountainRadius = 15;

// Seems like redundant copying of an arrow generator that could be made
// more generic for use in both pixi-wind-widget and this one - Saul
const MountainArrow = PixiComponent<IColumnHeightWidgetProps, PIXI.Graphics>("VEIWidget", {
  create: props => new PIXI.Graphics(),
  // didMount: (instance, parent) => {},
  // willUnmount: (instance, parent) => {},
  applyProps: (g, _: IColumnHeightWidgetProps, newProps: IColumnHeightWidgetProps) => {
    const { colHeight } = newProps;
    const length = colHeight * heightToLengthRatio;
    const lineEnd = 0 - length;
    const headCenter = lineEnd - arrowOffset;
    g.alpha = 1;
    g.clear();
    g.moveTo(0, 0);
    g.lineStyle(1, 0);
    g.lineTo(0, lineEnd);
    g.lineStyle(0, 0);
    g.beginFill(0, 1);
    g.drawStar(0, headCenter, 3, arrowheadRadius, 0, 0);
    g.endFill();

    g.lineStyle(0, 0);
    g.beginFill(0x999999, 1);
    g.drawStar(0 - mountainRadius - 5, 0 - mountainRadius / 2, 3, mountainRadius, 0, 0);
    g.endFill();
  }
});

export const ColumnHeightWidget = (props: IColumnHeightWidgetProps) => {
    const { location } = props;
    const {x, y} = location;

    return (
        <Container cacheAsBitmap={false} x={x} y={y}>
            <MountainArrow {...props} />
        </Container>
    );
};
