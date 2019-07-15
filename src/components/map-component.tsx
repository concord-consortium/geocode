import * as React from "react";
import * as L from "leaflet";

import { Map as LeafletMap, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../css/map-component.css";
import { iconVolcano, getCachedCircleIcon } from "./icons";

import { ICanvasShape, Ipoint } from "../interfaces";
import { CityType  } from "../stores/simulation-store";
import styled from "styled-components";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";
import { getSnapshot, IStateTreeNode } from "mobx-state-tree";
import { CrossSectionDrawLayer } from "./cross-section-draw-layer";
import { LocalToLatLng, LatLngToLocal } from "../utilities/coordinateSpaceConversion";
import { MapTephraThicknessLayer } from "./map-tephra-thickness-layer";

interface WorkspaceProps {
  width: number;
  height: number;
}
const CanvDiv = styled.div`
  border: 0px solid black; border-radius: 0px;
  width: ${(p: WorkspaceProps) => `${p.width}px`};
  height: ${(p: WorkspaceProps) => `${p.height}px`};
`;

interface IState {
  moveMouse: boolean;
}

interface IProps extends IBaseProps {
  numRows: number;
  numCols: number;
  width: number;
  height: number;
  windSpeed: number;
  windDirection: number;
  mass: number;
  colHeight: number;
  particleSize: number;
  volcanoLat: number;
  volcanoLng: number;
  gridColors: IStateTreeNode<any, string[]>;
  gridValues: IStateTreeNode<any, string[]>;
  cities: CityType[];
  map: string;
  isErupting: boolean;
  hasErupted: boolean;
  showCrossSectionSelector: boolean;
}

@inject("stores")
@observer
export class MapComponent extends BaseComponent<IProps, IState>{

  private ref = React.createRef<HTMLDivElement>();
  private map = React.createRef<LeafletMap>();
  private crossRef = React.createRef<CrossSectionDrawLayer>();
  private tephraRef = React.createRef<MapTephraThicknessLayer>();
  private metrics: ICanvasShape;

  constructor(props: IProps) {
    super(props);

    const initialState: IState = {
      moveMouse: false
    };

    this.handleDragMove = this.handleDragMove.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragExit = this.handleDragExit.bind(this);

    this.state = initialState;
  }

  public handleDragEnter(e: React.MouseEvent<HTMLDivElement>) {
    this.stores.setPoint1Pos(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    this.stores.setPoint2Pos(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    this.setState({moveMouse: true});
  }

  public handleDragMove(e: React.MouseEvent<HTMLDivElement>) {
    const { moveMouse } = this.state;
    if (moveMouse) {
      this.stores.setPoint2Pos(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  }

  public handleDragExit(e: React.MouseEvent<HTMLDivElement>) {
    this.stores.setPoint2Pos(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    this.setState({moveMouse: false});
  }

  public componentDidMount() {
    this.forceUpdate();
  }

  public render() {
    const {numCols, numRows, width, height } = this.props;
    const gridSize = Math.round(width / numCols);
    this.metrics  = {
      gridSize,
      height,
      width,
      numCols,
      numRows
    };

    const {
      cities,
      volcanoLat,
      volcanoLng,
      gridColors,
      gridValues,
      windDirection,
      windSpeed,
      colHeight,
      mass,
      particleSize,
      map,
      isErupting,
      hasErupted,
      showCrossSectionSelector
    } = this.props;

    const cityItems = cities.map( (city) => {
      const {x, y, name, id} = city;
      if (x && y && name) {
        const mapPos = LocalToLatLng({x, y}, L.latLng(volcanoLat, volcanoLng));
        const cityIcon = getCachedCircleIcon(name);
        return (
          <Marker
          position={[mapPos.lat, mapPos.lng]}
          icon={cityIcon}
          key={name}>
            <Popup>
              {name}
            </Popup>
          </Marker>
        );
      }
    });

    const { crossPoint1Lat, crossPoint1Lng, crossPoint2Lat, crossPoint2Lng } = this.stores;
    const volcanoPos = L.latLng(volcanoLat, volcanoLng);
    const corner1 = L.latLng(volcanoLat - 15, volcanoLng - 15);
    const corner2 = L.latLng(volcanoLat + 15, volcanoLng + 15);
    const bounds = L.latLngBounds(corner1, corner2);
    let viewportBounds = bounds;
    let mapRef = null;
    if (this.map.current) {
      mapRef = this.map.current.leafletElement;
      viewportBounds = this.map.current.leafletElement.getBounds();
    }

    return (
      <CanvDiv
        ref={this.ref}
        width={width}
        height={height}
      >
        <LeafletMap
          className="map"
          ref={this.map}
          ondragend={this.reRenderMap}
          onzoomend={this.reRenderMap}
          center={[volcanoLat, volcanoLng]}
          zoom={8}
          maxBounds={bounds}
          maxBoundsViscosity={1}
          minZoom={6}
          maxZoom={10}
          attributionControl={true}
          zoomControl={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          dragging={!showCrossSectionSelector}
          animate={true}
          easeLinearity={0.35}
          >
          <Marker
            position={[volcanoLat, volcanoLng]}
            icon={iconVolcano}>
            <Popup>
              Popup for any custom information.
            </Popup>
          </Marker>
          {cityItems}
          <TileLayer
              url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}@2x.png"
          />
          <MapTephraThicknessLayer
            ref={this.tephraRef}
            corner1Bound={corner1}
            corner2Bound={corner2}
            viewportBounds={viewportBounds}
            volcanoPos={volcanoPos}
            gridSize={1}
            map={mapRef}
            windSpeed={windSpeed}
            windDirection={windDirection}
            colHeight={colHeight}
            mass={mass}
            particleSize={particleSize}
          />
          { showCrossSectionSelector && <CrossSectionDrawLayer
            ref={this.crossRef}
            map={mapRef}
            p1Lat={crossPoint1Lat}
            p2Lat={crossPoint2Lat}
            p1Lng={crossPoint1Lng}
            p2Lng={crossPoint2Lng}
          /> }
        </LeafletMap>
      </CanvDiv>
    );
  }

  private reRenderMap = () => {
    if (this.tephraRef.current) {
      // By forcing the map to update, it re-renders the tephra thickness layer
      // This is called when the viewport changes, so it can re-render the dynamically
      // scaled tephra map
      this.forceUpdate();
    }
  }
}
