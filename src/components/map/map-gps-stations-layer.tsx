import * as React from "react";
import { inject, observer } from "mobx-react";
import { Map as LeafletMap, LayerGroup, Marker, CircleMarker, Popup, MarkerProps, Polyline } from "react-leaflet";
import { BaseComponent } from "../base";
import { StationData } from "../../strain";
import { LatLng } from "leaflet";

interface IProps {
  map: LeafletMap | null;
  mapScale: number;
  getPointFromLatLng: any;
}

interface IState {}

@inject("stores")
@observer
export class MapGPSStationsLayer extends BaseComponent<IProps, IState> {

  public render() {
    const { map, mapScale, getPointFromLatLng } = this.props;
    if (!map) return;

    const { visibleGPSStations, selectedGPSStationId, showVelocityArrows, allGPSStations }
      = this.stores.seismicSimulation;

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
    const mapScaleAdjust = 50;

    const velocityArrows = visibleGPSStations.map(stat => {
      // map scale is in meters per pixel, so use this as the basis for consistent length arrows at different zooms
      // though the distances are so large we need to reduce the multiplier by a constant to fit the screen.
      const arrowScale = mapScale / mapScaleAdjust;

      const startLatLng = new LatLng(stat.latitude, stat.longitude);
      // calculate the magnitude of the two component velocity values
      const velMag = Math.sqrt((stat.eastVelocity * stat.eastVelocity) + (stat.northVelocity * stat.northVelocity));
      // Adjust the scale of the magnitude to improve visibility
      // Stations move at a rate of meters per year, which is a small number.
      // so we multiply by the map scale
      const magnitude = velMag * arrowScale;
      const dir = Math.atan(stat.northVelocity / stat.eastVelocity);

      // we're working over a small area, so ignoring curvature of the Earth
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

    const velocityArrowScale = () => {
      // mapScale is meters per pixel
      // apply the same scale constant as used to draw arrows
      const adjustedScale = mapScale / mapScaleAdjust;
      // our stations move in a rough range of 0 to 50 mm/year
      // let's do the calculation for an arrow for one selected station.
      // QHTP moves at 25mm/year, a reasonable number for scale
      const stat = allGPSStations.find(s => s.id === "QHTP")!;
      const velMag = Math.sqrt((stat.eastVelocity * stat.eastVelocity) +
        (stat.northVelocity * stat.northVelocity));

      const magnitude = velMag * adjustedScale;
      const dir = Math.atan(stat.northVelocity / stat.eastVelocity);
      const startLatLng = new LatLng(stat.latitude, stat.longitude);
      // get the end point for the arrow we use for this station
      const endLat = stat.latitude + (magnitude * Math.cos(dir));
      const endLng = stat.longitude + (magnitude * Math.sin(dir));
      const endLatLng = new LatLng(endLat, endLng);

      // Need to call back to the containing component to get screen point information
      const p1 = getPointFromLatLng(startLatLng);
      const p2 = getPointFromLatLng(endLatLng);
      const pixelDistance = p1.distanceTo(p2);

      const arrowStyle = {
        width: pixelDistance
      };
      return <div className="arrow-scale" style={arrowStyle}>{Math.round(velMag * 1000)}mm/year</div>;
    };

    return (
      <LayerGroup map={map}>
        {markers}
        {showVelocityArrows && velocityArrows}
        {showVelocityArrows && velocityArrowScale()}
      </LayerGroup>
    );
  }

  private handleMarkerClicked = (props: Readonly<MarkerProps>) => {
    this.stores.seismicSimulation.selectGPSStation((props as any).sourceTarget.options.title);
  }
}
