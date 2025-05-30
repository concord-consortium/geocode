import SpeedDirectionWidget from "./speed-direction-widget";
import ColumnHeightWidget from "./column-height-widget";
import VEIWidget from "./vei-widget";
import EjectedVolumeWidget from "./ejected-volume-widget";
import { WidgetPanelTypes } from "../../utilities/widget";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";
import { LavaFrontHeightWidget } from "./lava-front-height-widget";
import { VentLocationWidget } from "./vent-location-widget";

const WidgetBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 16px;
`;

const WidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 11px;
  margin-left: 11px;
`;

const WidgetTitle = styled.div`
  font-size: 14px;
  color: white;
  margin-bottom: 5px;
`;

interface IProps {
  showColumnHeight?: boolean;
  showEjectedVolume?: boolean;
  showEruptedVolume?: boolean;
  showLavaFrontHeight?: boolean;
  showVEI?: boolean;
  showVentLocation?: boolean;
  showWindDirection?: boolean;
  showWindSpeed?: boolean;
}

interface IState {}

@inject("stores")
@observer
export default class WidgetPanel extends BaseComponent<IProps, IState> {
  public render() {
    const showColumnHeight = this.props.showColumnHeight && this.stores.uiStore.showColumnHeight;
    const showEjectedVolume = this.props.showEjectedVolume && this.stores.uiStore.showEjectedVolume;
    const showLavaFrontHeight = this.props.showLavaFrontHeight && this.stores.uiStore.showLavaFrontHeight;
    const showVEI = this.props.showVEI && this.stores.uiStore.showVEI;
    const showVentLocation = this.props.showVentLocation && this.stores.uiStore.showVentLocation;
    const showEruptedVolume = this.props.showEruptedVolume && this.stores.uiStore.showEruptedVolume;
    const showWindDirection = this.props.showWindDirection && this.stores.uiStore.showWindDirection;
    const showWindSpeed = this.props.showWindSpeed && this.stores.uiStore.showWindSpeed;
    const { vei, mass, colHeight, windDirection, windSpeed } = this.stores.tephraSimulation;
    const { residual, totalVolume } = this.stores.lavaSimulation;

    return (
      <WidgetBar>
        { (showWindSpeed || showWindDirection) &&
          <WidgetContainer data-test="wind-info-widget">
            <WidgetTitle>Wind Speed/Dir.</WidgetTitle>
            <SpeedDirectionWidget
              type={WidgetPanelTypes.RIGHT}
              showWindDirection={true}
              showWindSpeed={true}
              windDirection={windDirection}
              windSpeed={windSpeed}
            />
          </WidgetContainer> }
        { showVEI &&
          <WidgetContainer data-test="vei-widget">
            <WidgetTitle>VEI</WidgetTitle>
            <VEIWidget
              type={WidgetPanelTypes.RIGHT}
              vei={vei}
              mass={mass}
              columnHeight={colHeight}
            />
          </WidgetContainer> }
        { showEjectedVolume &&
          <WidgetContainer data-test="ejected-volume-widget">
            <WidgetTitle>Ejected Volume</WidgetTitle>
            <EjectedVolumeWidget
              mode="tephra"
              type={WidgetPanelTypes.RIGHT}
              eruptionVolume={mass / Math.pow(10, 12)}
            />
          </WidgetContainer> }
        { showVentLocation &&
          <WidgetContainer data-test="vent-location-widget">
            <WidgetTitle>Vent Location</WidgetTitle>
            <VentLocationWidget
              latitude={this.stores.lavaSimulation.ventLatitude}
              longitude={this.stores.lavaSimulation.ventLongitude}
            />
          </WidgetContainer> }
        { showLavaFrontHeight &&
          <WidgetContainer data-test="lava-front-height-widget">
            <WidgetTitle>Lava Front Height</WidgetTitle>
            <LavaFrontHeightWidget lavaFrontHeight={residual} />
          </WidgetContainer> }
        { showEruptedVolume &&
          <WidgetContainer data-test="volume-of-lava-widget">
            <WidgetTitle>Volume of Lava</WidgetTitle>
            <EjectedVolumeWidget
              mode="molasses"
              type={WidgetPanelTypes.RIGHT}
              eruptionVolume={totalVolume}
            />
          </WidgetContainer> }
        { showColumnHeight &&
          <WidgetContainer data-test="column-height-widget">
            <WidgetTitle>Column Height</WidgetTitle>
              <ColumnHeightWidget
                type={WidgetPanelTypes.RIGHT}
                columnHeightInKilometers={colHeight / 1000}
              />
          </WidgetContainer> }
      </WidgetBar>
    );
  }

}
