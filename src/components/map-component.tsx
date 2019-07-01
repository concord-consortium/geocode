import * as React from "react";
import * as L from "leaflet";

import { Map as LeafletMap, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../css/map-component.css";
import { iconVolcano } from "./volcano-icon";

import { ICanvasShape, Ipoint } from "../interfaces";
import { CityType  } from "../stores/simulation-store";
import styled from "styled-components";
import { Stage, Sprite } from "@inlet/react-pixi";
import { PixiCityContainer } from "./pixi-city-container";
import { PixiTephraMap } from "./pixi-tephra-map";
import { PixiAxis } from "./pixi-axis";
import { PixiGrid } from "./pixi-grid";
import VolcanoEmitter from "./pixi-volcano-emitter";
import * as AshConfig from "../assets/particles/ash.json";
import * as Color from "color";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";
import { getSnapshot, IStateTreeNode } from "mobx-state-tree";
import { EmitterConfig } from "pixi-particles";
import { LatLngBounds } from "leaflet";

interface WorkspaceProps {
  width: number;
  height: number;
}
const CanvDiv = styled.div`
  border: 0px solid black; border-radius: 0px;
  width: ${(p: WorkspaceProps) => `${p.width}px`};
  height: ${(p: WorkspaceProps) => `${p.height}px`};
`;

interface IState {}
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
}

@inject("stores")
@observer
export class MapComponent extends BaseComponent<IProps, IState>{

  private ref = React.createRef<HTMLDivElement>();
  private metrics: ICanvasShape;

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
      isErupting
    } = this.props;

    const cityItems = cities.map( (city) => {
      const {x, y, name, id} = city;
      if (x && y && name) {
        const mapPos = this.LocalToLatLng({x, y}, 1);
        console.log(this.LatLngToLocal(mapPos));
        return (
          <Marker
          position={[mapPos.x, mapPos.y]}
          icon={iconVolcano}
          key={name}>
            <Popup>
              {name}
            </Popup>
          </Marker>
        );
      }
    });

    const volcanoPos = this.LocalToLatLng({x: volcanoX, y: volcanoY}, gridSize);
    const corner1 = L.latLng(20, -50);
    const corner2 = L.latLng(50, -150);
    const bounds = L.latLngBounds(corner1, corner2);

    return (
      <CanvDiv
        ref={this.ref}
        width={width}
        height={height}
      >
        <LeafletMap
          className="map"
          maxBounds={undefined}
          maxBoundsViscosity={1}
          center={[50, 50]}
          zoom={5.8768}
          minZoom={3}
          maxZoom={20}
          attributionControl={true}
          zoomControl={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          dragging={true}
          animate={true}
          easeLinearity={0.35}
          >
          <Marker position={[volcanoX, volcanoY]}
          icon={iconVolcano}>
            <Popup>
              Popup for any custom information.
            </Popup>
          </Marker>
          {cityItems}
          <TileLayer
              url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
          />
        </LeafletMap>
        {/* <Stage
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
        </Stage> */}
      </CanvDiv>
    );
  }

  public LocalToLatLng = (point: Ipoint, scale = 1): Ipoint => {
    const { volcanoX, volcanoY } = this.props;
    const dist = Math.sqrt(point.x * point.x + point.y * point.y);
    const bearing = Math.atan((-1 * point.y) / point.x);
    const bearindRad = bearing;

    const latDiff = dist * Math.cos(bearindRad) / 111;
    const absoluteLat = volcanoY + latDiff;
    const longDiff = dist * Math.sin(bearindRad) / Math.cos(this.deg2rad(absoluteLat)) / 111;
    const absoluteLong = volcanoX + longDiff;

    return {x: absoluteLong, y: absoluteLat};
  }

  public LatLngToLocal = (point: Ipoint): Ipoint => {
    const { volcanoX, volcanoY } = this.props;
    const yDist = this.getDistanceFromLatLonInKm({x: volcanoX, y: volcanoY}, {x: point.x, y: volcanoY});
    const xDist = this.getDistanceFromLatLonInKm({x: volcanoX, y: volcanoY}, {x: volcanoX, y: point.y});

    return {x: xDist, y: yDist};
  }

  public getDistanceFromLatLonInKm = (point1: Ipoint, point2: Ipoint): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(point2.y - point1.y);  // deg2rad below
    const dLon = this.deg2rad(point2.x - point1.x);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.y)) * Math.cos(this.deg2rad(point2.y)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  public deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  }
}
