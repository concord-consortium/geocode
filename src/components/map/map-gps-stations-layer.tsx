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
    const selectedStroke = "#777";
    const fill = "#98e643";
    const selectedFill = "#43e6d8";

    const markers = visibleGPSStations.map(stat => {
      const selected = stat.id! === selectedGPSStationId;
      return (
        <CircleMarker key={stat.id}
          title={stat.id}
          center={[stat.latitude, stat.longitude]}
          radius={7}
          weight={selected ? 3 : 2}
          color={selected ? selectedStroke : stroke}
          fillColor={selected ? selectedFill : fill}
          fillOpacity={1}
          // @ts-ignore
          onclick={this.handleMarkerClicked}
        />
      );
    });

    return (
      <LayerGroup map={map}>
        { markers }
      </LayerGroup>
    );
  }

  private handleMarkerClicked = (props: Readonly<MarkerProps>) => {
    this.stores.seismicSimulation.selectGPSStation((props as any).sourceTarget.options.title);
  }
}
