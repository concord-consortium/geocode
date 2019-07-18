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
  viewportZoom: number;
  viewportCenterLat: number;
  viewportCenterLng: number;
  cities: CityType[];
  map: string;
  isErupting: boolean;
  hasErupted: boolean;
  showCrossSectionSelector: boolean;
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

  public componentDidMount() {
    this.forceUpdate();
  }

  public componentDidUpdate(prevProps: IProps) {
    const { showCrossSectionSelector } = this.props;
    if (showCrossSectionSelector === true && showCrossSectionSelector !== prevProps.showCrossSectionSelector) {
      this.setState({showRuler: false});
    }
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
      showCrossSectionSelector,
      showCrossSection
    } = this.props;

    const {
      showRuler
    } = this.state;

    const {
      isSelectingCrossSection
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
            { showCrossSectionSelector && <CrossSectionDrawLayer
              ref={this.crossRef}
              map={mapRef}
              p1Lat={crossPoint1Lat}
              p2Lat={crossPoint2Lat}
              p1Lng={crossPoint1Lng}
              p2Lng={crossPoint2Lng}
            /> }
            {showRuler && <RulerDrawLayer
              map={mapRef}
            />}
          </Pane>
        </LeafletMap>
        <OverlayControls
          showRuler={showRuler}
          onRulerClick={this.onRulerClick}
          isSelectingCrossSection={isSelectingCrossSection}
          showCrossSection={showCrossSection}
          onCrossSectionClick={this.onCrossSectionClick}
        />
      </CanvDiv>
    );
  }

  private onRulerClick = () => {
    this.setState({showRuler: !this.state.showRuler});
    this.stores.setCrossSectionSelectorVisibility(false);
    this.stores.setIsSelectingCrossSection(false);
  }

  private onCrossSectionClick = () => {
    this.stores.setIsSelectingCrossSection(!this.stores.isSelectingCrossSection);
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
