import * as React from "react";
import Button from "./overlay-button";

import "../css/overlay-controls.css";
import { observer, inject } from "mobx-react";
import { BaseComponent } from "./base";

interface IProps {
    showRuler: boolean;
    onRulerClick: () => void;
}

interface IState {}

@inject("stores")
@observer
export class OverlayControls extends BaseComponent<IProps, IState> {
    public render() {
        const { showRuler, onRulerClick } = this.props;

        const rulerColor = showRuler ? "primary" : "secondary";

        return (
            <div className="overlay-controls">
                <div className="controls bottom left">
                    <Button
                        onClick={onRulerClick}
                        color={rulerColor}>
                            Ruler
                    </Button>
                </div>
            </div>
        );
    }
}
