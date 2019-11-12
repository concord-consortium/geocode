import { inject, observer } from "mobx-react";
import Leaflet from "leaflet";
import * as L from "leaflet";
import * as React from "react";
import { BaseComponent } from "./base";
import { getCachedCircleIcon } from "./icons";
import { LayerGroup, Marker, Polyline } from "react-leaflet";

const MOUSE_DOWN = "mousedown touchstart";
const MOUSE_MOVE = "mousemove touchmove";
const MOVE_UP = "mouseup touchend";

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
export class CrossSectionDrawLayer extends BaseComponent<IProps, IState> {
  private _tempPoint1: Leaflet.LatLng;

  constructor(props: IProps) {
    super(props);
    this.drawStart = this.drawStart.bind(this);
    this.drawEnd = this.drawEnd.bind(this);
    this.setPoint1 = this.setPoint1.bind(this);
    this.setPoint2 = this.setPoint2.bind(this);
  }

  public componentDidMount() {
    const { map } = this.props;
    if (map !== null) {
      map.dragging.disable();
      map.on(MOUSE_DOWN, this.drawStart);
    }
  }

  public componentWillUnmount() {
    const { map } = this.props;
    if (map !== null) {
      map.dragging.enable();
      map.off(MOUSE_DOWN, this.drawStart);
    }
  }

  public drawStart(event: Leaflet.LeafletMouseEvent) {
    const { map } = this.props;
    this.setPoint1(event);
    this.setPoint2(event);
    if (map !== null) {
      map.dragging.disable();
      map.on(MOUSE_MOVE, this.setPoint2);
      map.on(MOVE_UP, this.drawEnd);
    }
  }

  public drawEnd() {
    const { map } = this.props;
    if (map !== null) {
      map.dragging.enable();
      map.off(MOUSE_MOVE, this.setPoint2);
      map.off(MOVE_UP, this.drawEnd);
    }
  }

  public setPoint1(event: Leaflet.LeafletEvent | null) {
    this.setPoint(0, event);
  }
  public setPoint2(event: Leaflet.LeafletEvent | null) {
    this.setPoint(1, event);
  }

  public setPoint(index: number, event: L.LeafletEvent | null) {
    let point = null;
    if (event) {
      const latLng = (event as Leaflet.LeafletMouseEvent).latlng;
      point = latLng;
    }
    if (index === 0 && point !== null) {
      this._tempPoint1 = point;
    }
    if (index === 1 && point !== null && this._tempPoint1 !== null) {
      point = point;
    }
    if (point !== null) {
        if (index === 0) {
          this.stores.simulation.setPoint1Pos(point.lat, point.lng);
        } else {
          this.stores.simulation.setPoint2Pos(point.lat, point.lng);
        }
    }
  }

  public render() {
    const { map } = this.props;
    const { p1Lat, p1Lng, p2Lat, p2Lng } = this.props;
    const point1 = L.latLng(p1Lat, p1Lng);
    const point2 = L.latLng(p2Lat, p2Lng);
    const p1Icon = getCachedCircleIcon("P1");
    const p2Icon = getCachedCircleIcon("P2");

    return (
      <LayerGroup map={map}>
        {point1 && <Marker position={point1} draggable={true} icon={p1Icon} onLeafletDrag={this.setPoint1} />}
        {point2 && <Marker position={point2} draggable={true} icon={p2Icon} onLeafletDrag={this.setPoint2} />}
        {point1 && point2 &&
          <Polyline
            key={"cross-section-line"}
            clickable={false}
            positions={[point1, point2]}
            color="#b263f7"
            opacity={1}
          />}
      </LayerGroup>
    );
  }
}
