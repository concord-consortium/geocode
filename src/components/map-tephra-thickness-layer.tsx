import * as React from "react";
import * as Leaflet from "leaflet";
import * as Color from "color";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "./base";
import { Ipoint } from "../interfaces";
import { LayerGroup, Rectangle } from "react-leaflet";

interface IProps {
    corner1Bound: Leaflet.LatLng;
    corner2Bound: Leaflet.LatLng;
    volcanoPos: Ipoint;
    gridSize: number;
    map: Leaflet.Map | null;
}

interface IState {}

@inject("stores")
@observer
export class MapTephraThicknessLayer extends BaseComponent<IProps, IState> {

    public render() {
        const { corner1Bound, corner2Bound, volcanoPos, gridSize, map } = this.props;
        const LatDist = Math.abs(corner1Bound.lat - corner2Bound.lat);
        const LongDist = Math.abs(corner1Bound.lng - corner2Bound.lng);
        const squareSize = 1;
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

                data.push(
                    <Rectangle
                        key={Lat + " " + Long}
                        bounds={Leaflet.latLngBounds(bound1, bound2)}
                        color={"red"}
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
