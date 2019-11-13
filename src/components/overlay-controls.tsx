import * as React from "react";
import Button from "./overlay-button";
import IconButton from "./icon-button";

import "../css/overlay-controls.css";
import { observer, inject } from "mobx-react";
import { BaseComponent } from "./base";

interface IProps {
    showRuler: boolean;
    onRulerClick: () => void;
    isSelectingCrossSection: boolean;
    showCrossSection: boolean;
    onCrossSectionClick: () => void;
    onReCenterClick: () => void;
}

interface IState {}

@inject("stores")
@observer
export class OverlayControls extends BaseComponent<IProps, IState> {
    public render() {
        const { showRuler,
            onRulerClick,
            isSelectingCrossSection,
            showCrossSection,
            onCrossSectionClick,
            onReCenterClick} = this.props;
        const { hasErupted } = this.stores.simulation;

        const rulerColor = showRuler ? "primary" : "secondary";
        const selectingColor = isSelectingCrossSection ? "primary" : "secondary";

        return (
            <div className="overlay-controls">
                <div className="controls bottom left">
                    <IconButton
                        onClick={onReCenterClick}
                        disabled={false}
                        label={"Re-center"}
                        hoverColor={"#ADD1A2"}
                        activeColor={"#B7DCAD"}
                        fill={"black"}
                        width={26}
                        height={26}
                    />
                    <IconButton
                        onClick={onRulerClick}
                        disabled={false}
                        label={"Ruler"}
                        hoverColor={"#ADD1A2"}
                        activeColor={"#B7DCAD"}
                        fill={"black"}
                        width={26}
                        height={26}
                    />
                </div>
                <div className="controls bottom right">
                    {(showCrossSection && hasErupted) && <Button
                        onClick={onCrossSectionClick}
                        color={selectingColor}>
                        Draw a cross section line
                    </Button>}
                </div>
            </div>
        );
    }
}
