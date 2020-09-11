import * as React from "react";
import { inject, observer } from "mobx-react";
import { Map as LeafletMap, LayerGroup, Marker, CircleMarker, Popup, MarkerProps } from "react-leaflet";
import { BaseComponent } from "../base";
import { StationData } from "../../strain";

interface IProps {
  map: LeafletMap | null;
}

interface IState {}

@inject("stores")
@observer
export class MapGPSStationsLayer extends BaseComponent<IProps, IState> {

  public render() {
    const { map  } = this.props;
    if (!map) return;

    const { visibleGPSStations, selectedGPSStationId } = this.stores.seismicSimulation;

    const stroke = "#9c9c9c";
    const selectedStroke = "#434343";
    const fill = "#98e643";
    const selectedFill = "#DDEDFF";

    const stationMarker = ((stat: StationData) => {
      const selected = stat.id! === selectedGPSStationId;
      return (
        <CircleMarker key={stat.id}
          title={stat.id}
          center={[stat.latitude, stat.longitude]}
          radius={selected ? 9 : 7}
          weight={selected ? 3 : 2}
          color={selected ? selectedStroke : stroke}
          fillColor={selected ? selectedFill : fill}
          fillOpacity={1}
          // @ts-ignore
          onclick={this.handleMarkerClicked}
        />
      );
    });

    // need to manually set z-index via different groups, as CircleMarker doesn't support zIndexOffet
    const markers = visibleGPSStations.filter(stat => stat.id! !== selectedGPSStationId).map(stationMarker);
    const selectedMarker = visibleGPSStations.filter(stat => stat.id! === selectedGPSStationId).map(stationMarker);

    return (
      <LayerGroup map={map}>
        { markers }
        { selectedMarker }
      </LayerGroup>
    );
  }

  private handleMarkerClicked = (props: Readonly<MarkerProps>) => {
    this.stores.seismicSimulation.selectGPSStation((props as any).sourceTarget.options.title);
  }
}
