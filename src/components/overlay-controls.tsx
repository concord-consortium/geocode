import * as React from "react";
import IconButton from "./buttons/icon-button";
import { RightSectionTypes, kRightTabInfo } from "./tabs";

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

        const rulerColor = showRuler ? kRightTabInfo[RightSectionTypes.CONDITIONS].hoverBackgroundColor : "white";
        const selectingColor = isSelectingCrossSection
                               ? kRightTabInfo[RightSectionTypes.CROSS_SECTION].hoverBackgroundColor
                               : "white";

        return (
            <div className="overlay-controls">
                <div className="controls bottom left">
                    <IconButton
                        onClick={onReCenterClick}
                        disabled={false}
                        label={"Re-center"}
                        hoverColor={kRightTabInfo[RightSectionTypes.CONDITIONS].hoverBackgroundColor}
                        activeColor={kRightTabInfo[RightSectionTypes.CONDITIONS].backgroundColor}
                        fill={"black"}
                        width={26}
                        height={26}
                        dataTest={"Re-center-button"}
                    />
                    <IconButton
                        onClick={onRulerClick}
                        disabled={false}
                        label={"Ruler"}
                        backgroundColor={rulerColor}
                        hoverColor={kRightTabInfo[RightSectionTypes.CONDITIONS].hoverBackgroundColor}
                        activeColor={kRightTabInfo[RightSectionTypes.CONDITIONS].backgroundColor}
                        fill={"black"}
                        width={26}
                        height={26}
                        dataTest={"Ruler-button"}
                    />
                </div>
                <div className="controls bottom right">
                    {(showCrossSection && hasErupted) && <IconButton
                        dataTest={isSelectingCrossSection ? "drawing-cross-section" : "not-drawing-cross-section"}
                        onClick={onCrossSectionClick}
                        disabled={false}
                        label={"Draw a cross section line"}
                        backgroundColor={selectingColor}
                        hoverColor={kRightTabInfo[RightSectionTypes.CROSS_SECTION].hoverBackgroundColor}
                        activeColor={kRightTabInfo[RightSectionTypes.CROSS_SECTION].backgroundColor}
                        fill={"black"}
                        width={26}
                        height={26}
                    />}
                </div>
            </div>
        );
    }
}
