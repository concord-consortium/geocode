import * as React from "react";
import { observer, inject } from "mobx-react";
import { BaseComponent } from "./base";
import RulerIcon from "../assets/map-icons/ruler.svg";
import SetPointIcon from "../assets/map-icons/set-point.svg";
import SetRegionIcon from "../assets/map-icons/set-region.svg";
import IconButton from "./buttons/icon-button";
import ExploreIcon from "../assets/map-icons/explore.svg";
import KeyButton from "./map/map-key-button";
import { RightSectionTypes } from "./tabs";
import { LegendComponent, LegendType } from "./map/map-legend";
import { ColorMethod } from "../stores/seismic-simulation-store";
import CompassComponent from "./map/map-compass";
import "../css/overlay-controls.css";

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
  panelType: RightSectionTypes;
}

interface IState {
  showKey: boolean;
}

@inject("stores")
@observer
export class OverlayControls extends BaseComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    const initialState: IState = {
      showKey: true,
    };
    this.state = initialState;
  }

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
      isSelectingDirection,
      panelType } = this.props;
    const { hasErupted } = this.stores.tephraSimulation;
    const { strainMapColorMethod } = this.stores.seismicSimulation;

    const legendType: LegendType = isTephraUnit
      ? (panelType !== RightSectionTypes.MONTE_CARLO ? "Tephra" : "Risk")
      : "Strain";

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
        <div className="controls top right">
          { this.state.showKey
            ? <KeyButton onClick={this.handleKeySelect}/>
            : <LegendComponent
                onClick={this.handleKeyButtonSelect}
                legendType={legendType}
                colorMethod={strainMapColorMethod as ColorMethod}
              />
          }
          <CompassComponent/>
        </div>
      </div>
    );
  }

  private handleKeySelect = () => {
    this.setState({showKey: false});
  }

  private handleKeyButtonSelect = () => {
    this.setState({showKey: true});
  }

}
