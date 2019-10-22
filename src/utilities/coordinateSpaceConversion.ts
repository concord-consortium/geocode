import { Ipoint } from "../interfaces";
import * as L from "leaflet";

/*
    Formulas for conversion translated from javascript code found here:
    https://www.movable-type.co.uk/scripts/latlong.html
*/
export const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

export const rad2deg = (rad: number): number => {
    return rad * (180 / Math.PI);
};

// Adaptation of "Destination point given distance and bearing from start point" formula
export const LocalToLatLng = (point: Ipoint, volcanoPos: L.LatLng): L.LatLng => {
    const volcanoLat = volcanoPos.lat;
    const volcanoLng = volcanoPos.lng;
    const d = Math.sqrt(point.x * point.x + point.y * point.y);
    const bearing = Math.atan2(point.x, point.y);
    const brng = bearing;
    const R = 6356; // Radius of the earth in km

    const newLat = Math.asin( Math.sin(deg2rad(volcanoLat)) * Math.cos(d / R) +
                    Math.cos(deg2rad(volcanoLat)) * Math.sin(d / R) * Math.cos(brng) );
    const newLong = deg2rad(volcanoLng) + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(deg2rad(volcanoLat)),
                            Math.cos(d / R) - Math.sin(deg2rad(volcanoLat)) * Math.sin(newLat));
    return (L.latLng(rad2deg(newLat), rad2deg(newLong)));
};

export const LatLngToLocal = (point: L.LatLng, volcanoPos: L.LatLng): Ipoint => {
    const longDist = getDistanceFromLatLonInKm(volcanoPos, L.latLng(volcanoPos.lat, point.lng));
    const latDist = getDistanceFromLatLonInKm(volcanoPos, L.latLng(point.lat, volcanoPos.lng));
    return {x: point.lat < volcanoPos.lat ?
                                 -1 * latDist :
                                 latDist,
            y: point.lng < volcanoPos.lng ?
                                 -1 * longDist :
                                 longDist};
};

// Haversine formula used for finding the distance between two latLng points
export const getDistanceFromLatLonInKm = (point1: L.LatLng, point2: L.LatLng): number => {
    const R = 6356; // Radius of the earth in km
    const φ1 = deg2rad(point1.lat);
    const φ2 = deg2rad(point2.lat);
    const Δφ = deg2rad(point2.lat - point1.lat);
    const Δλ = deg2rad(point2.lng - point1.lng);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;
    return d;
};
