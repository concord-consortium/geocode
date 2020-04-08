import * as React from "react";
import WindSpeedDirectionWidget from "./wind-speed-direction-widget";
import ColumnHeightWidget from "./column-height-widget";
import VEIWidget from "./vei-widget";
import EjectedVolumeWidget from "./ejected-volume-widget";
import { WidgetPanelTypes } from "../../utilities/widget";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";

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

interface IProps {}

interface IState {}

@inject("stores")
@observer
export default class WidgetPanel extends BaseComponent<IProps, IState> {
  public static defaultProps = {
    showWindSpeed: true,
    showWindDirection: true,
    showColumnHeight: true,
    showEjectedVolume: true,
    showVEI: true,
    windSpeed: 1,
    windDirection: 0,
    columnHeight: 1,
    vei: 1,
    mass: 1,
  };

  public render() {
    const { showVEI, showEjectedVolume, showColumnHeight, showWindSpeed, showWindDirection } = this.stores.uiStore;
    const { vei, mass, colHeight, windDirection, windSpeed } = this.stores.simulation;
    return (
      <WidgetBar>
        { (showWindSpeed || showWindDirection) && <WidgetContainer data-test="wind-info-widget">
          <WidgetTitle>Wind Speed/Dir.</WidgetTitle>
            <WindSpeedDirectionWidget
              type={WidgetPanelTypes.RIGHT}
              showWindDirection={true}
              showWindSpeed={true}
              windDirection={windDirection}
              windSpeed={windSpeed}
            />
        </WidgetContainer> }
        { showVEI && <WidgetContainer data-test="vei-widget">
          <WidgetTitle>VEI</WidgetTitle>
          <VEIWidget
            type={WidgetPanelTypes.RIGHT}
            vei={vei}
            mass={mass}
            columnHeight={colHeight}
          />
        </WidgetContainer> }
        { showEjectedVolume && <WidgetContainer data-test="ejected-volume-widget">
          <WidgetTitle>Ejected Volume</WidgetTitle>
          <EjectedVolumeWidget
            type={WidgetPanelTypes.RIGHT}
            volumeInKilometersCubed={mass / Math.pow(10, 12)}
          />
        </WidgetContainer> }
        { showColumnHeight && <WidgetContainer data-test="column-height-widget">
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
