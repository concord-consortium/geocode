import * as React from "react";
import * as Leaflet from "leaflet";
import * as Color from "color";
import * as d3 from "d3";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "./base";
import gridTephraCalc from "../tephra2";
import { Ipoint } from "../interfaces";
import { LayerGroup, ImageOverlay, Rectangle, Polyline, GeoJSON } from "react-leaflet";
import { LatLngToLocal } from "./coordinateSpaceConversion";
import { MultiPolygon } from "geojson";

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

    // Not ideal, but geoJson does not update with state changes
    // It will however update if given a new unique key.
    private keyval: number = 0;
    private gradient: Color[] = [new Color("rgb(66, 245, 239)"),
                                new Color("rgb(66, 245, 141)"),
                                new Color("rgb(117, 245, 66)"),
                                new Color("rgb(209, 245, 66)"),
                                new Color("rgb(245, 209, 66)"),
                                new Color("rgb(245, 126, 66)"),
                                new Color("rgb(245, 81, 66)"),
                                ];

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

        const data: number[] = [];

        for (let currentLat = 0; currentLat < LatSegments; currentLat++) {
            for (let currentLong = 0; currentLong < LongSegments; currentLong++) {
                const startingLat = corner1Bound.lat < corner2Bound.lat ? corner1Bound.lat : corner2Bound.lat;
                const startingLong = corner1Bound.lng < corner2Bound.lng ? corner1Bound.lng : corner2Bound.lng;

                const Lat = startingLat + currentLat * squareSize;
                const Long = startingLong + currentLong * squareSize;

                const bound1 = Leaflet.latLng(Lat, Long);
                const bound2 = Leaflet.latLng(Lat + squareSize, Long + squareSize);

                const localPos = LatLngToLocal({x: Lat + squareSize / 2, y: Long + squareSize / 2}, volcanoPos);
                // console.log(localPos);
                const simResults = gridTephraCalc(
                    localPos.x, localPos.y, 0, 0,
                    windSpeed,
                    windDirection,
                    colHeight,
                    mass,
                    particleSize
                  );

                // If opacity is 0, leaflet does not redraw the rectangle
                let thickness = 1.00000001;
                if (simResults > 1) {
                    thickness = maxTephra / Math.log10(simResults + 10);
                }
                // console.log(simResults);

                data.push(1 - thickness);
                // data.push(
                //     // <ImageOverlay
                //     //     url={"../assets/map-square.png"}
                //     //     key={Lat + " " + Long}
                //     //     bounds={Leaflet.latLngBounds(bound1, bound2)}
                //     //     opacity={1 - thickness}
                //     // />
                //     <Rectangle
                //         color={"red"}
                //         key={Lat + " " + Long}
                //         bounds={Leaflet.latLngBounds(bound1, bound2)}
                //         stroke={false}
                //         fillOpacity={1 - thickness}
                //     />
                // );
            }
        }

        const contours = d3.contours()
                        .size([LatSegments, LongSegments])
                        .thresholds(d3.range(1, 8).map(p => Math.pow(1.1, p) - 1))
                        .smooth(true)
                        (data);
        console.log(contours);

        contours.forEach(multipolygon => {
            multipolygon.coordinates.forEach(polygon => {
                polygon.forEach(poly => {
                    poly.forEach(coord => {
                        coord[0] = (coord[0] * squareSize) + corner1Bound.lng;
                        coord[1] = (coord[1] * squareSize) + corner1Bound.lat;
                    });
                });
            });
        });

        return (
            <LayerGroup map={map}>
                { this.renderGeoJson(contours) }
            </LayerGroup>
        );
    }

    private renderGeoJson(geojson: MultiPolygon[]) {
        let gradientIndex = 0;
        return(geojson.map(multipolygon => {
            return (<GeoJSON key={this.keyval++}
                stroke={false}
                fillOpacity={0.8}
                fillColor={this.gradient[gradientIndex++].string()}
                data={multipolygon}/>);
        }));
    }
}
