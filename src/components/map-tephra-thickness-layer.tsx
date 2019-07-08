import * as React from "react";
import * as Leaflet from "leaflet";
import * as Color from "color";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "./base";
import gridTephraCalc from "../tephra2";
import { Ipoint } from "../interfaces";
import { LayerGroup, ImageOverlay } from "react-leaflet";
import { LatLngToLocal } from "./coordinateSpaceConversion";

interface IProps {
    corner1Bound: Leaflet.LatLng;
    corner2Bound: Leaflet.LatLng;
    volcanoPos: Ipoint;
    gridSize: number;
    map: Leaflet.Map | null;
    windSpeed: number;
    windDirection: number;
    colHeight: number;
    mass: number;
    particleSize: number;
}

interface IState {}

@inject("stores")
@observer
export class MapTephraThicknessLayer extends BaseComponent<IProps, IState> {

    public render() {
        const { corner1Bound, corner2Bound, volcanoPos, gridSize, map,
            windSpeed,
            windDirection,
            colHeight,
            mass,
            particleSize } = this.props;
        const LatDist = Math.abs(corner1Bound.lat - corner2Bound.lat);
        const LongDist = Math.abs(corner1Bound.lng - corner2Bound.lng);
        const maxTephra = 1;
        const squareSize = 0.25;
        const LatSegments = LatDist / squareSize;
        const LongSegments = LongDist / squareSize;

        const data = [];

        for (let currentLat = 0; currentLat < LatSegments; currentLat++) {
            for (let currentLong = 0; currentLong < LongSegments; currentLong++) {
                const startingLat = corner1Bound.lat < corner2Bound.lat ? corner1Bound.lat : corner2Bound.lat;
                const startingLong = corner1Bound.lng < corner2Bound.lng ? corner1Bound.lng : corner2Bound.lng;

                const Lat = startingLat + currentLat * squareSize;
                const Long = startingLong + currentLong * squareSize;

                const bound1 = Leaflet.latLng(Lat, Long);
                const bound2 = Leaflet.latLng(Lat + squareSize, Long + squareSize);

                const localPos = LatLngToLocal({x: Lat, y: Long}, volcanoPos);
                // console.log(localPos);
                const simResults = gridTephraCalc(
                    localPos.x, localPos.y, 0, 0,
                    windSpeed,
                    windDirection,
                    colHeight,
                    mass,
                    particleSize
                  );

                let thickness = 1;
                if (simResults > 1) {
                    thickness = maxTephra / Math.log10(simResults + 10);
                }
                // console.log(simResults);
                data.push(
                    <ImageOverlay
                        url={"../assets/map-square.png"}
                        key={Lat + " " + Long}
                        bounds={Leaflet.latLngBounds(bound1, bound2)}
                        opacity={1 - thickness}
                    />
                );
            }
        }

        return (
            <LayerGroup map={map}>
                {data}
            </LayerGroup>
        );
    }
}
