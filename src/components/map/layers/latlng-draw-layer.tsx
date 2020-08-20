import { inject, observer } from "mobx-react";
import Leaflet from "leaflet";
import * as L from "leaflet";
import * as React from "react";
import { BaseComponent } from "../../base";
import { latLngIcon } from "../../icons";
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

interface IState {
  pointsSet: boolean;
}

@inject("stores")
@observer
export class LatLngDrawLayer extends BaseComponent<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    const initialState: IState = {
      pointsSet: false
    };

    this.drawPoints = this.drawPoints.bind(this);
    this.endDraw = this.endDraw.bind(this);
    this.setPoint1 = this.setPoint1.bind(this);
    this.setPoint2 = this.setPoint2.bind(this);
    this.dragPointStart = this.dragPointStart.bind(this);
    this.dragPointEnd = this.dragPointEnd.bind(this);
    this.state = initialState;
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
    const { latLngPoint1Lat } = this.stores.tephraSimulation;
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
        map.off(MOUSE_DOWN, this.drawPoints);
        this.setState({ pointsSet: true });
      }
    }
  }
  public endDraw() {
    const { map } = this.props;
    const { pointsSet } = this.state;
    if (map !== null) {
      // has the user entered two points?
      if (!pointsSet) {
        // user has clicked / tapped once to select first point
        map.off(MOUSE_MOVE, this.setPoint1);
      } else {
        // user click/dragged the points, assume we're finished
        map.dragging.enable();
        map.off(MOUSE_MOVE, this.setPoint1);
        map.off(MOUSE_MOVE, this.setPoint2);
      }
    }
  }

  public setPoint1(event: Leaflet.LeafletEvent | null) {
    const { map } = this.props;
    if (map !== null && event) {
      map.dragging.disable();
      let latLng = (event as Leaflet.LeafletMouseEvent).latlng;
      if (!latLng) latLng = event.target.getLatLng(); // for when we are dragging
      this.stores.tephraSimulation.setLatLngP1(latLng.lat, latLng.lng);
    }
  }

  public setPoint2(event: Leaflet.LeafletEvent | null) {
    const { map } = this.props;
    if (map !== null && event) {
      map.dragging.disable();
      let latLng = (event as Leaflet.LeafletMouseEvent).latlng;
      if (!latLng) latLng = event.target.getLatLng(); // for when we are dragging
      this.stores.tephraSimulation.setLatLngP2(latLng.lat, latLng.lng);
    }
  }

  public dragPointStart(event: Leaflet.LeafletEvent | null) {
    const { map } = this.props;
    if (map !== null && event) {
      map.dragging.disable();
      const markerIndex = event.target.options.marker_index;
      if (markerIndex === 1) {
        map.on(MOUSE_MOVE, this.setPoint1);
      }
      else {
        map.on(MOUSE_MOVE, this.setPoint2);
      }
    }
  }

  public dragPointEnd(event: Leaflet.LeafletEvent | null) {
    const { map } = this.props;
    if (map !== null && event) {
      map.dragging.enable();
      const markerIndex = event.target.options.marker_index;
      if (markerIndex === 1) {
        map.off(MOUSE_MOVE, this.setPoint1);
        this.setPoint1(event);
      }
      else {
        map.off(MOUSE_MOVE, this.setPoint2);
        this.setPoint2(event);
      }
    }
  }

  public render() {
    const { map } = this.props;
    const { p1Lat, p1Lng, p2Lat, p2Lng } = this.props;
    const point1 = L.latLng(p1Lat, p1Lng);
    const point2 = L.latLng(p2Lat, p2Lng);
    const point1a = L.latLng(p1Lat, p2Lng);
    const point2a = L.latLng(p2Lat, p1Lng);
    // figure out which corner is in which location
    const bounds = L.latLngBounds(point1, point2);
    let flipped = false;
    if (point1.lat === bounds.getNorthWest().lat && point1.lng === bounds.getNorthWest().lng) {
      flipped = false;
    } else {
      flipped = true;
    }
    const p1Icon = latLngIcon(`Latitude: ${p1Lat.toFixed(2)}<br/>Longitude: ${p1Lng.toFixed(2)}`, flipped ? "top-left" : "bottom-right");
    const p2Icon = latLngIcon(`Latitude: ${p2Lat.toFixed(2)}<br/>Longitude: ${p2Lng.toFixed(2)}`, flipped ? "bottom-right" : "top-left");

    return (
      <LayerGroup map={map}>
        {point1 && <Marker key={1} marker_index={1} position={point1} icon={p1Icon}
          draggable={true} onDragStart={this.dragPointStart} onDragEnd={this.dragPointEnd} />}
        {point2 && <Marker key={2} marker_index={2} position={point2} icon={p2Icon}
          draggable={true} onDragStart={this.dragPointStart} onDragEnd={this.dragPointEnd} />}
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
