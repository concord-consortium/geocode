import * as React from "react";
import { inject, observer } from "mobx-react";
import { Map as LeafletMap, LayerGroup, Marker, CircleMarker, Popup, MarkerProps, Polyline } from "react-leaflet";
import { BaseComponent } from "../base";
import { StationData } from "../../strain";
import { LatLng } from "leaflet";
import RawPositionTimeData from "../../assets/data/seismic/position-time-data";

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

    // stations for which we have position history
    const positionStations = Object.keys(RawPositionTimeData);

    const stroke = "#9c9c9c";
    const selectedStroke = "#434343";
    const color = (selected: boolean, isPosition: boolean) =>
      selected ?
        isPosition ? "#95c9ff" : "#DDEDFF" :
        isPosition ? "#37cfff" : "#98E643";

    const stationMarker = ((stat: StationData) => {
      const selected = stat.id === selectedGPSStationId;
      const isPosition = positionStations.includes(stat.id);
      const fill = color(selected, isPosition);
      return (
        <CircleMarker key={stat.id}
          title={stat.id}
          center={[stat.latitude, stat.longitude]}
          radius={selected ? 9 : 7}
          weight={selected ? 3 : 2}
          color={selected ? selectedStroke : stroke}
          fillColor={fill}
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
      const velMag = Math.sqrt((stat.eastVelocity ** 2) + (stat.northVelocity ** 2));
      // Adjust the scale of the magnitude to improve visibility
      // Stations move at a rate of meters per year, which is a small number.
      // so we multiply by the map scale
      const magnitude = velMag * arrowScale;
      const dir = Math.atan2(stat.eastVelocity, stat.northVelocity);

      // we're working over a small area, so ignoring curvature of the Earth
      const endLat = startLatLng.lat + (magnitude * Math.cos(dir));
      const endLng = startLatLng.lng + (magnitude * Math.sin(dir));
      const endLatLng = new LatLng(endLat, endLng);

      // arrowhead
      const arrowBaseMag = Math.min(0.2, magnitude * 0.4);

      const a1Lat = endLatLng.lat + (arrowBaseMag * -Math.cos(dir - 0.3));
      const a1Lng = endLatLng.lng + (arrowBaseMag * -Math.sin(dir - 0.3));
      const a1LatLng = new LatLng(a1Lat, a1Lng);

      const a2Lat = endLatLng.lat + (arrowBaseMag * -Math.cos(dir + 0.3));
      const a2Lng = endLatLng.lng + (arrowBaseMag * -Math.sin(dir + 0.3));
      const a2LatLng = new LatLng(a2Lat, a2Lng);

      return <Polyline positions={[startLatLng, endLatLng, a1LatLng, endLatLng, a2LatLng]} key={stat.id}
        weight={1} />;
    });

    const velocityArrowScale = () => {
      // mapScale is meters per pixel
      // apply the same scale constant as used to draw arrows
      const adjustedScale = mapScale / mapScaleAdjust;
      // our stations move in a rough range of 0 to 50 mm/year
      const velMag = 0.025; // 25m mm/year
      const magnitude = velMag * adjustedScale;
      const startLatLng = new LatLng(0, 0);
      const endLatLng = new LatLng(0, magnitude);

      // Need to call back to the containing component to get screen point information
      const p1 = getPointFromLatLng(startLatLng);
      const p2 = getPointFromLatLng(endLatLng);
      const pixelDistance = p1.distanceTo(p2);

      const arrowStyle = {
        width: pixelDistance
      };
      return <div className="arrow-scale" style={arrowStyle}>{Math.round(velMag * 1000)}mm/year</div>;
    };

    // need to manually set z-index via different groups, as CircleMarker doesn't support zIndexOffet
    const markers = visibleGPSStations.filter(stat => stat.id! !== selectedGPSStationId).map(stationMarker);
    const selectedMarker = visibleGPSStations.filter(stat => stat.id! === selectedGPSStationId).map(stationMarker);

    return (
      <LayerGroup map={map}>
        {markers}
        {selectedMarker}
        {showVelocityArrows && velocityArrows}
        {showVelocityArrows && velocityArrowScale()}
      </LayerGroup>
    );
  }

  private handleMarkerClicked = (props: Readonly<MarkerProps>) => {
    this.stores.seismicSimulation.selectGPSStation((props as any).sourceTarget.options.title);
  }
}
