import * as React from "react";
import * as Leaflet from "leaflet";
import * as Color from "color";
import * as d3 from "d3";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "./base";
import gridTephraCalc from "../tephra2";
import { LayerGroup, GeoJSON } from "react-leaflet";
import { LatLngToLocal } from "../utilities/coordinateSpaceConversion";
import { MultiPolygon } from "geojson";

interface IProps {
    corner1Bound: Leaflet.LatLng;
    corner2Bound: Leaflet.LatLng;
    viewportBounds: Leaflet.LatLngBounds;
    volcanoPos: Leaflet.LatLng;
    gridSize: number;
    map: Leaflet.Map | null;
    windSpeed: number;
    windDirection: number;
    colHeight: number;
    mass: number;
    hasErupted: boolean;
}

interface IState {}

@inject("stores")
@observer
export class MapTephraThicknessLayer extends BaseComponent<IProps, IState> {

    // Not ideal, but geoJson does not update with state changes
    // It will however update if given a new unique key.
    private keyval: number = 0;

    private gradient: Color[] = [new Color("rgb(238, 226, 112)"),
                                new Color("rgb(255, 191, 78)"),
                                new Color("rgb(255, 117, 75)"),
                                new Color("rgb(233, 78, 131)"),
                                new Color("rgb(174, 78, 211)"),
                                new Color("rgb(123, 88, 174)"),
                                new Color("rgb(81, 90, 148)"),
                                ];

    public render() {
        const {
            volcanoPos,
            map,
            windSpeed,
            windDirection,
            colHeight,
            mass,
            viewportBounds,
            hasErupted } = this.props;

        if (!hasErupted) {
            return (null);
        }

        const longDist = Math.abs(viewportBounds.getNorthEast().lng - viewportBounds.getSouthWest().lng);
        const maxTephra = 1;
        const samplesPerScreenPerAxis = 75;
        const squareSize = longDist / (samplesPerScreenPerAxis); // This assumes a square map
        const latSegments = samplesPerScreenPerAxis;
        const longSegments = samplesPerScreenPerAxis;

        const data: number[] = [];

        for (let currentLat = 0; currentLat < latSegments; currentLat++) {
            for (let currentLong = 0; currentLong < longSegments; currentLong++) {
                const startingLat = viewportBounds.getNorthEast().lat < viewportBounds.getSouthWest().lat ?
                                    viewportBounds.getNorthEast().lat :
                                    viewportBounds.getSouthWest().lat;
                const startingLong = viewportBounds.getNorthEast().lng < viewportBounds.getSouthWest().lng ?
                                    viewportBounds.getNorthEast().lng :
                                    viewportBounds.getSouthWest().lng;

                const lat = startingLat + currentLat * squareSize;
                const long = startingLong + currentLong * squareSize;

                const localPos = LatLngToLocal(Leaflet.latLng(lat + squareSize / 2, long + squareSize / 2), volcanoPos);

                const simResults = gridTephraCalc(
                    localPos.x, localPos.y, 0, 0,
                    windSpeed,
                    windDirection,
                    colHeight,
                    mass
                  );

                const thickness = maxTephra / Math.log10(simResults + 10);

                data.push(1 - thickness);
            }
        }

        const contours = d3.contours()
                        .size([latSegments, longSegments])
                        .thresholds(d3.range(1, 8).map(p => Math.pow(1.1, p) - 1))
                        .smooth(true)
                        (data);

        contours.forEach(multipolygon => {
            multipolygon.coordinates.forEach(polygon => {
                polygon.forEach(poly => {
                    poly.forEach(coord => {
                        coord[0] = (coord[0] * squareSize) + viewportBounds.getSouthWest().lng;
                        coord[1] = (coord[1] * squareSize) + viewportBounds.getSouthWest().lat;
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
