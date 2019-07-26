import * as React from "react";
import Button from "./overlay-button";

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
        const { hasErupted } = this.stores;

        const rulerColor = showRuler ? "primary" : "secondary";
        const selectingColor = isSelectingCrossSection ? "primary" : "secondary";

        return (
            <div className="overlay-controls">
                <div className="controls bottom left">
                    <Button
                        onClick={onReCenterClick}
                        color={"secondary"}>
                            Re-Center
                    </Button>
                    <Button
                        onClick={onRulerClick}
                        color={rulerColor}>
                            Ruler
                    </Button>
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
