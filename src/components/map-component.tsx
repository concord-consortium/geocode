import * as React from "react";
import * as L from "leaflet";

import { Map as LeafletMap, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../css/map-component.css";
import { iconVolcano, getCachedCircleIcon } from "./icons";

import { ICanvasShape, Ipoint } from "../interfaces";
import { CityType  } from "../stores/simulation-store";
import styled from "styled-components";
import { Stage, Sprite } from "@inlet/react-pixi";
import { PixiCityContainer } from "./pixi-city-container";
import { PixiTephraMap } from "./pixi-tephra-map";
import { PixiAxis } from "./pixi-axis";
import { PixiGrid } from "./pixi-grid";
import { CrossSectionSelectorComponent } from "./pixi-cross-section-selector";
import VolcanoEmitter from "./pixi-volcano-emitter";
import * as AshConfig from "../assets/particles/ash.json";
import * as Color from "color";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";
import { getSnapshot, IStateTreeNode } from "mobx-state-tree";
import { EmitterConfig } from "pixi-particles";
import { LatLngBounds } from "leaflet";
import { CrossSectionDrawLayer } from "./cross-section-draw-layer";
import { LocalToLatLng, LatLngToLocal } from "./coordinateSpaceConversion";

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
  volcanoX: number;
  volcanoY: number;
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
      volcanoX,
      volcanoY,
      gridColors,
      gridValues,
      windDirection,
      windSpeed,
      mass,
      map,
      isErupting,
      hasErupted,
      showCrossSectionSelector
    } = this.props;

    const cityItems = cities.map( (city) => {
      const {x, y, name, id} = city;
      if (x && y && name) {
        const mapPos = LocalToLatLng({x: y, y: x}, {x: volcanoX, y: volcanoY});
        const cityIcon = getCachedCircleIcon(name);
        return (
          <Marker
          position={[mapPos.x, mapPos.y]}
          icon={cityIcon}
          key={name}>
            <Popup>
              {name}
            </Popup>
          </Marker>
        );
      }
    });

    const { crossPoint1X, crossPoint1Y, crossPoint2X, crossPoint2Y } = this.stores;
    const volcanoPos = LocalToLatLng({x: volcanoX, y: volcanoY}, {x: volcanoX, y: volcanoY});
    const corner1 = L.latLng(35, -115);
    const corner2 = L.latLng(55, -135);
    const bounds = L.latLngBounds(corner1, corner2);
    let mapRef = null;
    if (this.map.current) {
      mapRef = this.map.current.leafletElement;
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
          maxBounds={bounds}
          maxBoundsViscosity={1}
          center={[volcanoX, volcanoY]}
          zoom={8}
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
            position={[volcanoX, volcanoY]}
            icon={iconVolcano}>
            <Popup>
              Popup for any custom information.
            </Popup>
          </Marker>
          {cityItems}
          <TileLayer
              url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
          />
          { showCrossSectionSelector && <CrossSectionDrawLayer
            ref={this.crossRef}
            map={mapRef}
            p1X={crossPoint1X}
            p2X={crossPoint2X}
            p1Y={crossPoint1Y}
            p2Y={crossPoint2Y}
          /> }
        </LeafletMap>
        {/* <Stage
    const volcanoPos = this.toCanvasCoords({x: volcanoX, y: volcanoY}, gridSize);
    const { crossPoint1X, crossPoint1Y, crossPoint2X, crossPoint2Y } = this.stores;
    const { moveMouse } = this.state;

    return (
      <CanvDiv ref={this.ref}
        onMouseMove={this.handleDragMove}
        onMouseDown={this.handleDragEnter}
        onMouseUp={this.handleDragExit}>
        <Stage
          width={width}
          height={height}
          options={
            {
              backgroundColor: Color("hsl(0, 10%, 95%)").rgbNumber(),
              antialias: true
            }
          } >
          <Sprite image={map} x={0} y={0} width={width} height={height} />

          <PixiTephraMap
            canvasMetrics={this.metrics}
            gridColors={getSnapshot(gridColors)}
            gridValues={getSnapshot(gridValues)}
            toCanvasCoords={this.toCanvasCoords} />
          {cityItems}
          <PixiAxis gridMetrics={this.metrics} toCanvasCoords={this.toCanvasCoords} />
          <PixiGrid gridMetrics={this.metrics} />
          <Sprite image={"./assets/volcano.png"}
            x={volcanoPos.x - 10}
            y={volcanoPos.y - 10}
            width={60}
            height={60} />
          <VolcanoEmitter
            config={AshConfig.config as unknown as EmitterConfig}
            imagePath={AshConfig.image}
            x={volcanoPos.x + 20}
            y={volcanoPos.y + 20}
            windDirection={windDirection}
            windSpeed={windSpeed}
            mass={mass}
            playing={isErupting} />
          {showCrossSectionSelector && hasErupted &&
          <CrossSectionSelectorComponent
            crossPoint2X={crossPoint2X}
            crossPoint2Y={crossPoint2Y}
            crossPoint1X={crossPoint1X}
            crossPoint1Y={crossPoint1Y}
            isPlaced={moveMouse} /> }
        </Stage> */}
      </CanvDiv>
    );
  }
}
