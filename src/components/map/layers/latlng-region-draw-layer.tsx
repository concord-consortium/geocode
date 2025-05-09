import { inject, observer } from "mobx-react";
import Leaflet from "leaflet";
const L = Leaflet;
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
export class LatLngRegionDrawLayer extends BaseComponent<IProps, IState> {

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
      L.DomUtil.addClass(map.getContainer(), "crosshair-cursor");
    }
  }

  public componentWillUnmount() {
    const { map } = this.props;
    if (map !== null) {
      map.dragging.enable();
      map.off(MOUSE_DOWN, this.drawPoints);
      map.off(MOUSE_UP, this.endDraw);
      L.DomUtil.removeClass(map.getContainer(), "crosshair-cursor");
    }
  }
  public drawPoints(event: Leaflet.LeafletMouseEvent) {
    const { map } = this.props;
    const { latLngRegionPoint1Lat } = this.stores.tephraSimulation;
    if (map !== null) {
      if (latLngRegionPoint1Lat === 0) {
        map.dragging.disable();
        this.setPoint1(event);
        this.setPoint2(event);
        map.on(MOUSE_MOVE, this.setPoint2);
      }
    }
  }
  public endDraw() {
    const { map } = this.props;
    const { pointsSet } = this.state;
    if (map !== null) {
      // has the user entered two points?
      if (!pointsSet) {
        // user has clicked / tapped to complete initial rectangle
        map.dragging.enable();
        map.off(MOUSE_MOVE, this.setPoint1);
        map.off(MOUSE_MOVE, this.setPoint2);
        map.off(MOUSE_DOWN, this.drawPoints);
        this.setState({ pointsSet: true });
        L.DomUtil.removeClass(map.getContainer(), "crosshair-cursor");
      } else {
        // user dragged the points
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
    const { pointsSet } = this.state;
    if (!map) return null;

    const { p1Lat, p1Lng, p2Lat, p2Lng } = this.props;
    const point1 = L.latLng(p1Lat, p1Lng);
    const point2 = L.latLng(p2Lat, p2Lng);
    const point1a = L.latLng(p1Lat, p2Lng);
    const point2a = L.latLng(p2Lat, p1Lng);

    const mapBounds = map.getBounds();
    const labelWidth = 116;
    const labelHeight = 56;

    const getCorner = (point: L.LatLng, otherPoint: L.LatLng, isPt1 = true) => {
      let cornerString;

      const containerPoint = map.latLngToContainerPoint(point);
      const mapSouthContainerPoint = map.latLngToContainerPoint(L.latLng(mapBounds.getSouth(), point.lng));
      const mapEastContainerPoint =  map.latLngToContainerPoint(L.latLng(point.lat, mapBounds.getEast()));
      const willOverlapNorth = containerPoint.y < labelHeight;
      const willOverlapSouth = containerPoint.y > mapSouthContainerPoint.y - labelHeight;
      const willOverlapWest = containerPoint.x < labelWidth;
      const willOverlapEast = containerPoint.x > mapEastContainerPoint.x - labelWidth;

      if ((point.lat > otherPoint.lat && !willOverlapNorth) || willOverlapSouth) {
        cornerString = "bottom-";
      } else {
        cornerString = "top-";
      }
      if ((point.lng > otherPoint.lng && !willOverlapEast) || willOverlapWest) {
        cornerString += "left";
      } else {
        cornerString += "right";
      }
      return cornerString;
    };

    const p1Icon = latLngIcon(
      `<b>Corner 1</b><br/>Latitude: ${p1Lat.toFixed(2)} <b>W</b><br/>Longitude: ${p1Lng.toFixed(2)} <b>N</b>`,
      getCorner(point1, point2), !pointsSet);
    const p2Icon = latLngIcon(
      `<b>Corner 2</b><br/>Latitude: ${p2Lat.toFixed(2)} <b>W</b><br/>Longitude: ${p2Lng.toFixed(2)} <b>N</b>`,
      getCorner(point2, point1, false), !pointsSet);

    return (
      <LayerGroup map={map}>
        {point1 && point2 &&
          <Polyline
            key={"lat-lng-line"}
            clickable={false}
            positions={[point1, point1a, point2, point2a, point1]}
            color="#b263f7"
            opacity={1}
          />}
        {point1 && <Marker key={"latlngp1"} marker_index={1} position={point1} icon={p1Icon}
          draggable={true} onDragStart={this.dragPointStart} onDragEnd={this.dragPointEnd} />}
        {point2 && <Marker key={"latlngp2"} marker_index={2} position={point2} icon={p2Icon}
          draggable={true} onDragStart={this.dragPointStart} onDragEnd={this.dragPointEnd} />}
      </LayerGroup>
    );
  }
}
