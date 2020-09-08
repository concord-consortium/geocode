import * as React from "react";
import { inject, observer } from "mobx-react";
import { Map as LeafletMap, LayerGroup, Marker, CircleMarker, Popup, MarkerProps, Polyline } from "react-leaflet";
import { BaseComponent } from "../base";
import { StationData } from "../../strain";
import { LatLng } from "leaflet";

interface IProps {
  map: LeafletMap | null;
  mapScale: number | null;
}

interface IState {}

@inject("stores")
@observer
export class MapGPSStationsLayer extends BaseComponent<IProps, IState> {

  public render() {
    const { map, mapScale  } = this.props;
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

    const velocityArrows = visibleGPSStations.map(stat => {
      const arrowScale = mapScale ? (20 - mapScale) : 5;
      const startLatLng = new LatLng(stat.latitude, stat.longitude);
      const magnitude = Math.sqrt((stat.eastVelocity * stat.eastVelocity) + (stat.northVelocity * stat.northVelocity))
        * arrowScale;
      const dir = Math.atan(stat.northVelocity / stat.eastVelocity);
      const endLat = startLatLng.lat + (magnitude * Math.cos(dir));
      const endLng = startLatLng.lng + (magnitude * Math.sin(dir));
      const endLatLng = new LatLng(endLat, endLng);

      // arrowhead
      const arrowBaseMag = magnitude * 0.8;
      const a1Lat = startLatLng.lat + (arrowBaseMag * Math.cos(dir * 0.9));
      const a1Lng = startLatLng.lng + (arrowBaseMag * Math.sin(dir * 0.9));
      const a1LatLng = new LatLng(a1Lat, a1Lng);

      const a2Lat = startLatLng.lat + (arrowBaseMag * Math.cos(dir * 1.1));
      const a2Lng = startLatLng.lng + (arrowBaseMag * Math.sin(dir * 1.1));
      const a2LatLng = new LatLng(a2Lat, a2Lng);

      return <Polyline positions={[startLatLng, endLatLng, a1LatLng, endLatLng, a2LatLng]} key={stat.id}
        weight={1} />;
    });
    console.log(mapScale);
    return (
      <LayerGroup map={map}>
        {markers}
        {velocityArrows}
      </LayerGroup>
    );
  }

  private handleMarkerClicked = (props: Readonly<MarkerProps>) => {
    this.stores.seismicSimulation.selectGPSStation((props as any).sourceTarget.options.title);
  }
}
