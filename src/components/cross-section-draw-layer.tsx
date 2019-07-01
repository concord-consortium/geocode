import { inject, observer } from "mobx-react";
import { PureComponent } from "react";
import Leaflet, { LeafletEvent } from "leaflet";
import * as L from "leaflet";
import * as React from "react";
import { Ipoint } from "../interfaces";
import { BaseComponent, IBaseProps } from "./base";
import { iconVolcano } from "./volcano-icon";
import { LayerGroup, Marker, Polyline, Polygon, withLeaflet, LeafletEvents } from "react-leaflet";
// import { circleIcon } from '../custom-leaflet/icons'
// import crossSectionRectangle, { pointToArray, limitDistance } from '../core/cross-section-rectangle'
// import config from '../config'

const MOUSE_DOWN = "mousedown touchstart";
const MOUSE_MOVE = "mousemove touchmove";
const MOVE_UP = "mouseup touchend";

interface IProps {
  map: Leaflet.Map | null;
  p1X: number;
  p1Y: number;
  p2X: number;
  p2Y: number;
}

interface IState {}

@inject("stores")
@observer
export class CrossSectionDrawLayer extends BaseComponent<IProps, IState> {
  private _tempPoint1: Ipoint;

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
    this.setPoint2(null);
    if (map !== null) {
        map.on(MOUSE_MOVE, this.setPoint2);
        map.on(MOVE_UP, this.drawEnd);
    }
  }

  public drawEnd() {
    const { map } = this.props;
    if (map !== null) {
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
    // const { setCrossSectionPoint } = this.props
    let point = null;
    if (event) {
      const latLng = (event as Leaflet.LeafletMouseEvent).latlng;
      point = {x: latLng.lng, y: latLng.lat}; // pointToArray(latLng);
    }
    if (index === 0 && point !== null) {
      this._tempPoint1 = point;
    }
    if (index === 1 && point !== null && this._tempPoint1 !== null) {
      point = point; // limitDistance(this._tempPoint1, point, config.maxCrossSectionLength);
    }
    // setCrossSectionPoint(index, point)
    if (point !== null) {
        if (index === 0) {
          this.stores.setPoint1Pos(point.x, point.y);
        } else {
          this.stores.setPoint2Pos(point.x, point.y);
        }
    }
  }

  public render() {
    const { map } = this.props;
    const { p1X, p1Y, p2X, p2Y } = this.props;
    const point1 = L.latLng(p1Y, p1X);
    const point2 = L.latLng(p2Y, p2X);
    // const rect = crossSectionRectangle(point1, point2);
    return (
      <LayerGroup map={map}>
        {point1 && <Marker position={point1} draggable={true} icon={iconVolcano} onLeafletDrag={this.setPoint1} />}
        {point2 && <Marker position={point2} draggable={true} icon={iconVolcano} onLeafletDrag={this.setPoint2} />}
        {point1 && point2 &&
          <Polyline
            clickable={false}
            className="cross-section-line"
            positions={[point1, point2]}
            color="#fff"
            opacity={1}
          />}
        {/* {rect && <Polygon positions={rect} clickable={false} color='#fff' weight={2} />} */}
      </LayerGroup>
    );
  }
}
