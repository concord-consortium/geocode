import * as React from "react";
import { PureComponent } from "react";
import VEIWidget from "./vei-widget";
import EjectedVolumeWidget from "./ejected-volume-widget";
import { WidgetPanelTypes } from "../utilities/widget";
import styled from "styled-components";

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
  showWindSpeed: boolean;
  showWindDirection: boolean;
  showColumnHeight: boolean;
  showEjectedVolume: boolean;
  showVEI: boolean;
  windSpeed: number;
  windDirection: number;
  columnHeight: number; // m for vei, km for col height
  vei: number;
  mass: number;
}

interface IState {}

export default class WidgetPanel extends PureComponent<IProps, IState> {
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
    const { showVEI, showEjectedVolume, vei, mass, columnHeight } = this.props;
    return (
      <WidgetBar>
        { showVEI && <WidgetContainer>
          <WidgetTitle>VEI</WidgetTitle>
          <VEIWidget
            type={WidgetPanelTypes.RIGHT}
            vei={vei}
            mass={mass}
            columnHeight={columnHeight}
          />
        </WidgetContainer> }
        { showEjectedVolume && <WidgetContainer>
          <WidgetTitle>Ejected Volume</WidgetTitle>
          <EjectedVolumeWidget
            type={WidgetPanelTypes.RIGHT}
            volumeInKilometersCubed={mass / Math.pow(10, 12)}
          />
        </WidgetContainer> }
      </WidgetBar>
    );
  }

}
