import * as React from "react";
import RulerIcon from "../assets/map-icons/ruler.svg";
import SetPointIcon from "../assets/map-icons/set-point.svg";
import SetRegionIcon from "../assets/map-icons/set-region.svg";
import IconButton from "./buttons/icon-button";
import ExploreIcon from "../assets/map-icons/explore.svg";
import "../css/overlay-controls.css";
import { observer, inject } from "mobx-react";
import { BaseComponent } from "./base";

const kButtonColor = "white";
const kButtonSelectedColor = "#cee6c9";
const kButtonHoverColor = "#cee6c9";
const kButtonSelectedHoverColor = "#b7dcad";
const kButtonActiveColor = "#e6f2e4";

interface IProps {
  showRuler: boolean;
  onRulerClick: () => void;
  onSetPointClick: () => void;
  onSetRegionClick: () => void;
  isSelectingCrossSection: boolean;
  isSelectingSetPoint: boolean;
  isSelectingSetRegion: boolean;
  isSelectingDirection: boolean;
  showCrossSection: boolean;
  onCrossSectionClick: () => void;
  onReCenterClick: () => void;
  onDirectionClick: () => void;
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
      onReCenterClick,
      onDirectionClick,
      isSelectingDirection } = this.props;
    const { hasErupted } = this.stores.tephraSimulation;

    return (
      <div className="overlay-controls">
        <div className="controls bottom left">
          <IconButton
            onClick={onReCenterClick}
            disabled={false}
            label={"Re-center"}
            hoverColor={kButtonHoverColor}
            activeColor={kButtonActiveColor}
            fill={"black"}
            dataTest={"Re-center-button"}
          />
          {isTephraUnit && <IconButton
            children={<RulerIcon />}
            onClick={onRulerClick}
            disabled={false}
            label={"Ruler"}
            backgroundColor={showRuler ? kButtonSelectedColor : kButtonColor}
            hoverColor={showRuler ? kButtonSelectedHoverColor : kButtonHoverColor}
            activeColor={kButtonActiveColor}
            fill={"black"}
            width={26}
            height={26}
            dataTest={"Ruler-button"}
          />}
          {isSeismicUnit && <IconButton
            children={<SetPointIcon />}
            onClick={onSetPointClick}
            disabled={false}
            label={"Set Point"}
            backgroundColor={isSelectingSetPoint ? kButtonSelectedColor : kButtonColor}
            hoverColor={isSelectingSetPoint ? kButtonSelectedHoverColor : kButtonHoverColor}
            activeColor={kButtonActiveColor}
            fill={"black"}
            width={16}
            height={16}
            dataTest={"Latlng-point-button"}
          />}
          {isSeismicUnit && <IconButton
            children={<SetRegionIcon />}
            onClick={onSetRegionClick}
            disabled={false}
            label={"Set Region"}
            backgroundColor={isSelectingSetRegion ? kButtonSelectedColor : kButtonColor}
            hoverColor={isSelectingSetRegion ? kButtonSelectedHoverColor : kButtonHoverColor}
            activeColor={kButtonActiveColor}
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
            backgroundColor={isSelectingCrossSection ? kButtonSelectedColor : kButtonColor}
            hoverColor={isSelectingCrossSection ? kButtonSelectedHoverColor : kButtonHoverColor}
            activeColor={kButtonActiveColor}
            fill={"black"}
            width={26}
            height={26}
          />}
          {isSeismicUnit && <IconButton
            onClick={onDirectionClick}
            children={<ExploreIcon />}
            disabled={false}
            label={"Direction"}
            backgroundColor={isSelectingDirection ? kButtonSelectedColor : kButtonColor}
            hoverColor={isSelectingDirection ? kButtonSelectedHoverColor : kButtonHoverColor}
            activeColor={kButtonActiveColor}
            fill={"black"}
            width={26}
            height={26}
            dataTest={"directionb-button"}
          />}
        </div>
      </div>
    );
  }
}
