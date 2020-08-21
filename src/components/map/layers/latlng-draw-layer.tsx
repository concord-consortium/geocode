import { inject, observer } from "mobx-react";
import Leaflet from "leaflet";
import * as L from "leaflet";
import * as React from "react";
import { BaseComponent } from "../../base";
import { getCachedCircleIcon } from "../../icons";
import { LayerGroup, Marker, Polyline } from "react-leaflet";

const MOUSE_DOWN = "mousedown touchstart";
const MOUSE_MOVE = "mousemove touchmove";
const MOUSE_UP = "mouseup touchend";

interface IProps {
  map: Leaflet.Map | null;
  p1Lat: number;
  p1Lng: number;
  p2Lat: number;
  p2Lng: number;
}

interface IState {}

@inject("stores")
@observer
export class LatLngDrawLayer extends BaseComponent<IProps, IState> {
  private _tempPoint1: Leaflet.LatLng;

  constructor(props: IProps) {
    super(props);
    this.drawPoints = this.drawPoints.bind(this);
    this.endDraw = this.endDraw.bind(this);
    this.setPoint1 = this.setPoint1.bind(this);
    this.setPoint2 = this.setPoint2.bind(this);
  }

  public componentDidMount() {
    const { map } = this.props;
    if (map !== null) {
      map.dragging.disable();
      map.on(MOUSE_DOWN, this.drawPoints);
      map.on(MOUSE_UP, this.endDraw);
    }
  }

  public componentWillUnmount() {
    const { map } = this.props;
    if (map !== null) {
      map.dragging.enable();
      map.off(MOUSE_DOWN, this.drawPoints);
    }
  }
  public drawPoints(event: Leaflet.LeafletMouseEvent) {
    const { map } = this.props;
    const { latLngPoint1Lat } = this.stores.simulation;
    if (map !== null) {
      if (latLngPoint1Lat === 0) {
        map.dragging.disable();
        this.setPoint1(event);
        this.setPoint2(event);
        map.on(MOUSE_MOVE, this.setPoint2);
      }
      else {
        this.setPoint2(event);
        map.dragging.enable();
        map.off(MOUSE_MOVE, this.setPoint2);
      }
    }
  }
  public endDraw() {
    const { map } = this.props;
    map.dragging.enable();
  }
  public setPoint1(event: Leaflet.LeafletEvent | null) {
    const { map } = this.props;
    if (event) {
      map.dragging.disable();
      const latLng = (event as Leaflet.LeafletMouseEvent).latlng;
      this.stores.simulation.setLatLngP1(latLng.lat, latLng.lng);
    }
  }
  public setPoint2(event: Leaflet.LeafletEvent | null) {
    const { map } = this.props;
    if (event) {
      map.dragging.disable();
      const latLng = (event as Leaflet.LeafletMouseEvent).latlng;
      this.stores.simulation.setLatLngP2(latLng.lat, latLng.lng);
    }
  }

  public render() {
    const { map } = this.props;
    const { p1Lat, p1Lng, p2Lat, p2Lng } = this.props;
    const point1 = L.latLng(p1Lat, p1Lng);
    const point2 = L.latLng(p2Lat, p2Lng);
    const point1a = L.latLng(p1Lat, p2Lng);
    const point2a = L.latLng(p2Lat, p1Lng);
    const p1Icon = getCachedCircleIcon("P1");
    const p2Icon = getCachedCircleIcon("P2");

    return (
      <LayerGroup map={map}>
        {point1 && <Marker position={point1} draggable={true} icon={p1Icon} onLeafletDrag={this.setPoint1} />}
        {point2 && <Marker position={point2} draggable={true} icon={p2Icon} onLeafletDrag={this.setPoint2} />}
        {point1 && point2 &&
          <Polyline
            key={"lat-lng-line"}
            clickable={false}
            positions={[point1, point1a, point2, point2a, point1]}
            color="#b263f7"
            opacity={1}
          />}
      </LayerGroup>
    );
  }
}
