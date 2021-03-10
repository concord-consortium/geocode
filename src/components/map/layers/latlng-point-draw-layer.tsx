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
  pLat: number;
  pLng: number;
}

interface IState {
  pointSet: boolean;
}

@inject("stores")
@observer
export class LatLngPointDrawLayer extends BaseComponent<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    const initialState: IState = {
      pointSet: false
    };

    this.drawPoint = this.drawPoint.bind(this);
    this.endDraw = this.endDraw.bind(this);
    this.setPoint = this.setPoint.bind(this);
    this.dragPointStart = this.dragPointStart.bind(this);
    this.dragPointEnd = this.dragPointEnd.bind(this);
    this.state = initialState;
  }

  public componentDidMount() {
    const { map } = this.props;
    if (map !== null) {
      map.dragging.disable();
      map.on(MOUSE_DOWN, this.drawPoint);
      map.on(MOUSE_UP, this.endDraw);
      L.DomUtil.addClass(map.getContainer(), "crosshair-cursor");
    }
  }

  public componentWillUnmount() {
    const { map } = this.props;
    if (map !== null) {
      map.dragging.enable();
      map.off(MOUSE_DOWN, this.drawPoint);
      L.DomUtil.removeClass(map.getContainer(), "crosshair-cursor");
    }
  }
  public drawPoint(event: Leaflet.LeafletMouseEvent) {
    const { map } = this.props;
    const { latLngPointLat } = this.stores.tephraSimulation;
    if (map !== null) {
      if (latLngPointLat === 0) {
        map.dragging.disable();
        this.setPoint(event);
      }
    }
  }
  public endDraw() {
    const { map } = this.props;
    const { pointSet } = this.state;
    if (map !== null) {
      // has the user entered two points?
      if (!pointSet) {
        // user has clicked / tapped to place point
        map.dragging.enable();
        map.off(MOUSE_MOVE, this.setPoint);
        map.off(MOUSE_DOWN, this.drawPoint);
        this.setState({ pointSet: true });
        L.DomUtil.removeClass(map.getContainer(), "crosshair-cursor");
      } else {
        // user dragged the point
        map.dragging.enable();
        map.off(MOUSE_MOVE, this.setPoint);
      }
    }
  }

  public setPoint(event: Leaflet.LeafletEvent | null) {
    const { map } = this.props;
    if (map !== null && event) {
      map.dragging.disable();
      let latLng = (event as Leaflet.LeafletMouseEvent).latlng;
      if (!latLng) latLng = event.target.getLatLng(); // for when we are dragging
      this.stores.tephraSimulation.setLatLngPoint(latLng.lat, latLng.lng);
    }
  }

  public dragPointStart(event: Leaflet.LeafletEvent | null) {
    const { map } = this.props;
    if (map !== null && event) {
      map.dragging.disable();
      map.on(MOUSE_MOVE, this.setPoint);
    }
  }

  public dragPointEnd(event: Leaflet.LeafletEvent | null) {
    const { map } = this.props;
    if (map !== null && event) {
      map.dragging.enable();
      this.setPoint(event);
    }
  }

  public render() {
    const { map } = this.props;
    const { pointSet } = this.state;
    if (!map) return null;

    const { pLat, pLng } = this.props;
    const point = L.latLng(pLat, pLng);

    const mapBounds = map.getBounds();
    const labelWidth = 116;
    const labelHeight = 56;

    const getCorner = (cornerPoint: L.LatLng) => {
      let cornerString;

      const containerPoint = map.latLngToContainerPoint(cornerPoint);
      const mapSouthContainerPoint = map.latLngToContainerPoint(L.latLng(mapBounds.getSouth(), cornerPoint.lng));
      const mapEastContainerPoint =  map.latLngToContainerPoint(L.latLng(cornerPoint.lat, mapBounds.getEast()));
      const willOverlapNorth = containerPoint.y < labelHeight;
      const willOverlapSouth = containerPoint.y > mapSouthContainerPoint.y - labelHeight;
      const willOverlapWest = containerPoint.x < labelWidth;
      const willOverlapEast = containerPoint.x > mapEastContainerPoint.x - labelWidth;

      !willOverlapNorth || willOverlapSouth ? cornerString = "bottom-" : cornerString = "top-";
      !willOverlapEast || willOverlapWest ? cornerString += "left" : cornerString += "right";
      return cornerString;
    };

    const pIcon = latLngIcon(
      `<b>Corner 1</b><br/>Latitude: ${pLat.toFixed(2)} <b>W</b><br/>Longitude: ${pLng.toFixed(2)} <b>N</b>`,
      getCorner(point), !pointSet);

    return (
      <LayerGroup map={map}>
        {point && <Marker key={"latlngp1"} marker_index={1} position={point} icon={pIcon}
          draggable={true} onDragStart={this.dragPointStart} onDragEnd={this.dragPointEnd} />}
      </LayerGroup>
    );
  }
}
