import Leaflet from "leaflet";
import Color from "color";
import { contours } from "d3";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";
import gridTephraCalc from "../../tephra2";
import { LayerGroup, GeoJSON } from "react-leaflet";
import { LatLngToLocal } from "../../utilities/coordinateSpaceConversion";
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
        const latDist = Math.abs(viewportBounds.getNorthEast().lat - viewportBounds.getSouthWest().lat);
        const samplesPerScreenPerAxis = 75;
        const longSize = longDist / (samplesPerScreenPerAxis);
        const latSize = latDist / (samplesPerScreenPerAxis);
        const latSegments = samplesPerScreenPerAxis;
        const longSegments = samplesPerScreenPerAxis;

        const startingLat = viewportBounds.getNorthEast().lat < viewportBounds.getSouthWest().lat ?
                viewportBounds.getNorthEast().lat :
                viewportBounds.getSouthWest().lat;
        const startingLong = viewportBounds.getNorthEast().lng < viewportBounds.getSouthWest().lng ?
                viewportBounds.getNorthEast().lng :
                viewportBounds.getSouthWest().lng;

        const data: number[] = [];

        for (let currentLat = 0; currentLat < latSegments; currentLat++) {
            for (let currentLong = 0; currentLong < longSegments; currentLong++) {
                const lat = startingLat + currentLat * latSize;
                const long = startingLong + currentLong * longSize;

                const localPos = LatLngToLocal(Leaflet.latLng(lat + latSize / 2, long + longSize / 2), volcanoPos);

                const simResults = gridTephraCalc(
                    localPos.x, localPos.y, 0, 0,
                    windSpeed,
                    windDirection,
                    colHeight,
                    mass
                  );

                const thickness = simResults * 10;      // cm => mm

                data.push(thickness);
            }
        }

        const _contours = contours()
                        .size([latSegments, longSegments])
                        .thresholds([1000, 300, 100, 30, 10, 3, 1])
                        .smooth(false)
                        (data);

        _contours.forEach(multipolygon => {
            multipolygon.coordinates.forEach(polygon => {
                polygon.forEach(poly => {
                    poly.forEach(coord => {
                        coord[0] = (coord[0] * longSize) + startingLong;
                        coord[1] = (coord[1] * latSize) + startingLat;
                    });
                });
            });
        });

        return (
            <LayerGroup map={map}>
                { this.renderGeoJson(_contours) }
            </LayerGroup>
        );
    }

    private renderGeoJson(geojson: MultiPolygon[]) {
        let gradientIndex = 0;
        return(geojson.map((multipolygon, i) => {
            if (i < geojson.length - 1 && geojson[i + 1].coordinates.length > 0) {
                geojson[i + 1].coordinates.forEach((item) => multipolygon.coordinates.push(item));
            }
            return (<GeoJSON key={this.keyval++}
                stroke={false}
                fillOpacity={0.8}
                fillColor={this.gradient[gradientIndex++].string()}
                data={multipolygon}/>);
        }));
    }
}
