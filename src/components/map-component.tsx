import * as React from "react";
import * as L from "leaflet";

import { Map as LeafletMap, TileLayer, Marker, Popup, ScaleControl, Pane } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../css/map-component.css";
import { iconVolcano, getCachedCircleIcon, getCachedDivIcon } from "./icons";

import { ICanvasShape, Ipoint } from "../interfaces";
import { CityType  } from "../stores/simulation-store";
import styled from "styled-components";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";
import { getSnapshot, IStateTreeNode } from "mobx-state-tree";
import { CrossSectionDrawLayer } from "./cross-section-draw-layer";
import { LocalToLatLng, LatLngToLocal } from "../utilities/coordinateSpaceConversion";
import { MapTephraThicknessLayer } from "./map-tephra-thickness-layer";
import { OverlayControls } from "./overlay-controls";
import { RulerDrawLayer } from "./ruler-draw-layer";

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
  showRuler: boolean;
}

interface IProps extends IBaseProps {
  width: number;
  height: number;
  windSpeed: number;
  windDirection: number;
  mass: number;
  colHeight: number;
  particleSize: number;
  volcanoLat: number;
  volcanoLng: number;
  topLeftLat: number;
  topLeftLng: number;
  bottomRightLat: number;
  bottomRightLng: number;
  initialZoom: number;
  minZoom: number;
  maxZoom: number;
  viewportZoom: number;
  viewportCenterLat: number;
  viewportCenterLng: number;
  cities: CityType[];
  map: string;
  isErupting: boolean;
  hasErupted: boolean;
  showCrossSection: boolean;
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
      moveMouse: false,
      showRuler: false
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

  public render() {
    const { width, height } = this.props;

    const {
      cities,
      volcanoLat,
      volcanoLng,
      windDirection,
      windSpeed,
      colHeight,
      mass,
      particleSize,
      map,
      isErupting,
      hasErupted,
      showCrossSection,
      initialZoom,
      minZoom,
      maxZoom,
      topLeftLat,
      topLeftLng,
      bottomRightLat,
      bottomRightLng
    } = this.props;

    const {
      isSelectingCrossSection,
      isSelectingRuler
    } = this.stores;

    const cityItems = cities.map( (city) => {
      const {x, y, name, id} = city;
      if (x && y && name) {
        const mapPos = LocalToLatLng({x, y}, L.latLng(volcanoLat, volcanoLng));
        const cityIcon = getCachedDivIcon(name);
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
    const corner1 = L.latLng(topLeftLat, topLeftLng);
    const corner2 = L.latLng(bottomRightLat, bottomRightLng);
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
          zoom={initialZoom}
          maxBounds={bounds}
          maxBoundsViscosity={1}
          minZoom={minZoom}
          maxZoom={maxZoom}
          attributionControl={true}
          zoomControl={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          dragging={!(isSelectingRuler || isSelectingCrossSection)}
          animate={true}
          easeLinearity={0.35}
          >
          <ScaleControl
            position="topright"
          />
          <Pane
            style={{zIndex: 0}}>
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
              hasErupted={hasErupted}
            />
          </Pane>
          <Pane
            style={{zIndex: 3}}>
            <Marker
              position={[volcanoLat, volcanoLng]}
              icon={iconVolcano}>
              <Popup>
                Popup for any custom information.
              </Popup>
            </Marker>
            {cityItems}
            { isSelectingCrossSection && <CrossSectionDrawLayer
              ref={this.crossRef}
              map={mapRef}
              p1Lat={crossPoint1Lat}
              p2Lat={crossPoint2Lat}
              p1Lng={crossPoint1Lng}
              p2Lng={crossPoint2Lng}
            /> }
            {isSelectingRuler && <RulerDrawLayer
              map={mapRef}
            />}
          </Pane>
        </LeafletMap>
        <OverlayControls
          showRuler={isSelectingRuler}
          onRulerClick={this.stores.rulerClick}
          isSelectingCrossSection={isSelectingCrossSection}
          showCrossSection={hasErupted && showCrossSection}
          onCrossSectionClick={this.stores.crossSectionClick}
          onReCenterClick={this.onRecenterClick}
        />
      </CanvDiv>
    );
  }

  private onRecenterClick = () => {
    if (this.map.current) {
      const {volcanoLat, volcanoLng, initialZoom} = this.props;

      this.map.current.leafletElement.flyTo(L.latLng(volcanoLat, volcanoLng), initialZoom);
    }
  }

  private reRenderMap = () => {
    if (this.tephraRef.current) {

      // Update values in the store to trigger a rerender of this component
      if (this.map.current) {
        const center = this.map.current.leafletElement.getCenter();
        const zoom = this.map.current.leafletElement.getZoom();
        this.stores.setViewportParameters(zoom, center.lat, center.lng);
      }
    }
  }
}
