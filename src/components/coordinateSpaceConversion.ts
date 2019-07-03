import { Ipoint } from "../interfaces";

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
export const LocalToLatLng = (point: Ipoint, volcanoPos: Ipoint): Ipoint => {
    const volcanoX = volcanoPos.y;
    const volcanoY = volcanoPos.x;
    const d = Math.sqrt(point.x * point.x + point.y * point.y);
    const bearing = Math.atan((point.y) / (point.x));
    const brng = bearing;
    const R = 6356;

    const newLat = Math.asin( Math.sin(deg2rad(volcanoY)) * Math.cos(d / R) +
                    Math.cos(deg2rad(volcanoY)) * Math.sin(d / R) * Math.cos(brng) );
    const newLong = deg2rad(volcanoX) + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(deg2rad(volcanoY)),
                            Math.cos(d / R) - Math.sin(deg2rad(volcanoY)) * Math.sin(newLat));
    return ({x: rad2deg(newLat), y: rad2deg(newLong)});
};

export const LatLngToLocal = (point: Ipoint, volcanoPos: Ipoint): Ipoint => {
    const volcanoX = volcanoPos.x;
    const volcanoY = volcanoPos.y;
    const longDist = getDistanceFromLatLonInKm({x: volcanoX, y: volcanoY}, {x: point.x, y: volcanoY});
    const latDist = getDistanceFromLatLonInKm({x: volcanoX, y: volcanoY}, {x: volcanoX, y: point.y});
    return {x: point.y < volcanoY ? -1 * latDist : latDist, y: point.x < volcanoX ? -1 * longDist : longDist};
};

// Haversine formula used for finding the distance between two latLng points
export const getDistanceFromLatLonInKm = (point1: Ipoint, point2: Ipoint): number => {
    const R = 6356; // km
    const φ1 = deg2rad(point1.x);
    const φ2 = deg2rad(point2.x);
    const Δφ = deg2rad(point2.x - point1.x);
    const Δλ = deg2rad(point2.y - point1.y);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;
    return d;
};
