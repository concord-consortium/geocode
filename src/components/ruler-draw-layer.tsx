import { inject, observer } from "mobx-react";
import Leaflet from "leaflet";
import * as L from "leaflet";
import * as React from "react";
import { BaseComponent } from "./base";
import { getCachedCircleIcon, divIcon } from "./icons";
import { LayerGroup, Marker, Polyline } from "react-leaflet";
import { getDistanceFromLatLonInKm } from "../utilities/coordinateSpaceConversion";

import "../css/custom-leaflet-icons.css";

const MOUSE_DOWN = "mousedown touchstart";
const MOUSE_MOVE = "mousemove touchmove";
const MOVE_UP = "mouseup touchend";

interface IProps {
  map: Leaflet.Map | null;
}

interface IState {
    pointLat: number;
    pointLng: number;
}

@inject("stores")
@observer
export class RulerDrawLayer extends BaseComponent<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.drawStart = this.drawStart.bind(this);
    this.drawEnd = this.drawEnd.bind(this);
    this.setPoint = this.setPoint.bind(this);

    const { volcanoLat, volcanoLng } = this.stores;

    const initialState: IState = {
        pointLat: volcanoLat,
        pointLng: volcanoLng
    };

    this.state = initialState;
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
    this.setPoint(event);
    if (map !== null) {
        map.dragging.disable();
        map.on(MOUSE_MOVE, this.setPoint);
        map.on(MOVE_UP, this.drawEnd);
    }
  }

  public drawEnd() {
    const { map } = this.props;
    if (map !== null) {
        map.dragging.enable();
        map.off(MOUSE_MOVE, this.setPoint);
        map.off(MOVE_UP, this.drawEnd);
    }
  }

  public setPoint(event: L.LeafletMouseEvent) {
    let point = null;
    if (event) {
      point = event.latlng;
    }

    if (point !== null) {
        this.setState({pointLat: point.lat, pointLng: point.lng});
    }
  }

  public render() {
    const { map } = this.props;
    const { pointLat, pointLng } = this.state;
    const { volcanoLat, volcanoLng } = this.stores;
    const point1 = L.latLng(volcanoLat, volcanoLng);
    const point2 = L.latLng(pointLat, pointLng);
    const point3 = L.latLng(volcanoLat, pointLng);

    const midLng = volcanoLng + ((pointLng - volcanoLng) / 2);
    const midLat = volcanoLat + ((pointLat - volcanoLat) / 2);
    const xMidPoint = L.latLng(volcanoLat, midLng);
    const yMidPoint = L.latLng(midLat, pointLng);
    const rMidPoint = L.latLng(midLat, midLng);

    const p1Icon = getCachedCircleIcon("");
    const p2Icon = getCachedCircleIcon("");

    const xDist = getDistanceFromLatLonInKm(point1, point3);
    const yDist = getDistanceFromLatLonInKm(point2, point3);
    const adjustedXDist = point3.lng < point1.lng ? -1 * xDist : xDist;
    const adjustedYDist = point2.lat < point3.lat ? -1 * yDist : yDist;

    const totalDist = getDistanceFromLatLonInKm(point1, point2);

    const xData = "X: " + adjustedXDist.toFixed(2) + "km";
    const xDataIcon = divIcon(xData); // I choose not to cache this one as it is changing every time

    const yData = "Y: " + adjustedYDist.toFixed(2) + "km";
    const yDataIcon = divIcon(yData);

    const rData = "R: " + totalDist.toFixed(2) + "km";
    const rDataIcon = divIcon(rData);

    return (
      <LayerGroup map={map}>
        {point1 && <Marker position={point1} icon={p1Icon} />}
        {point2 && <Marker position={point2} draggable={true} icon={p2Icon} onLeafletDrag={this.setPoint} />}
        {point1 && point2 &&
          [<Polyline
            key={"triangle"}
            clickable={false}
            positions={[point1, point2, point3, point1]}
            color="#b263f7"
            opacity={1}
          />,
          <Marker
            icon={xDataIcon}
            key={"xData-Popup"}
            position={xMidPoint}
          />,
          <Marker
            icon={yDataIcon}
            key={"yData-Popup"}
            position={yMidPoint}
          />,
          <Marker
            icon={rDataIcon}
            key={"rData-Popup"}
            position={rMidPoint}
          />]}
      </LayerGroup>
    );
  }
}
