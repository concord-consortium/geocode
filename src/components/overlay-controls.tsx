import * as React from "react";
import IconButton from "./buttons/icon-button";
import { RightSectionTypes, kRightTabInfo } from "./tabs";

import "../css/overlay-controls.css";
import { observer, inject } from "mobx-react";
import { BaseComponent } from "./base";

interface IProps {
    showRuler: boolean;
    onRulerClick: () => void;
    onSetPointClick: () => void;
    onSetRegionClick: () => void;
    isSelectingCrossSection: boolean;
    isSelectingSetPoint: boolean;
    isSelectingSetRegion: boolean;
    showCrossSection: boolean;
    onCrossSectionClick: () => void;
    onReCenterClick: () => void;
}

interface IState {}

@inject("stores")
@observer
export class OverlayControls extends BaseComponent<IProps, IState> {
    public render() {
        const { name: unitName } = this.stores.unit;

        const isTephraUnit = unitName === "Tephra";
        const isSeismicUnit = unitName === "Seismic";

        const { showRuler,
            onRulerClick,
            onSetPointClick,
            onSetRegionClick,
            isSelectingCrossSection,
            isSelectingSetPoint,
            isSelectingSetRegion,
            showCrossSection,
            onCrossSectionClick,
            onReCenterClick} = this.props;
        const { hasErupted } = this.stores.tephraSimulation;

        const rulerColor = showRuler ? kRightTabInfo[RightSectionTypes.CONDITIONS].hoverBackgroundColor : "white";
        const selectingLatLngPtColor = isSelectingSetPoint
                               ? kRightTabInfo[RightSectionTypes.CROSS_SECTION].hoverBackgroundColor
                               : "white";
        const selectingLatLngRegionColor = isSelectingSetRegion
                               ? kRightTabInfo[RightSectionTypes.CROSS_SECTION].hoverBackgroundColor
                               : "white";
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
                    {isTephraUnit && <IconButton
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
                    />}
                    {isSeismicUnit && <IconButton
                        onClick={onSetPointClick}
                        disabled={false}
                        label={"Set Point"}
                        backgroundColor={selectingLatLngPtColor}
                        hoverColor={kRightTabInfo[RightSectionTypes.CONDITIONS].hoverBackgroundColor}
                        activeColor={kRightTabInfo[RightSectionTypes.CONDITIONS].backgroundColor}
                        fill={"black"}
                        width={26}
                        height={26}
                        dataTest={"Latlng-point-button"}
                    />}
                    {isSeismicUnit && <IconButton
                        onClick={onSetRegionClick}
                        disabled={false}
                        label={"Set Region"}
                        backgroundColor={selectingLatLngRegionColor}
                        hoverColor={kRightTabInfo[RightSectionTypes.CONDITIONS].hoverBackgroundColor}
                        activeColor={kRightTabInfo[RightSectionTypes.CONDITIONS].backgroundColor}
                        fill={"black"}
                        width={26}
                        height={26}
                        dataTest={"Latlng-region-button"}
                    />}
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
