import { Ipoint } from "../interfaces";

export const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

export const LocalToLatLng = (point: Ipoint, volcanoPos: Ipoint, scale = 1): Ipoint => {
    const volcanoX = volcanoPos.x;
    const volcanoY = volcanoPos.y;
    const dist = Math.sqrt(point.x * point.x + point.y * point.y);
    const bearing = Math.atan((-1 * point.y) / point.x);
    const bearindRad = bearing;

    const latDiff = dist * Math.cos(bearindRad) / 111;
    const absoluteLat = volcanoY + latDiff;
    const longDiff = dist * Math.sin(bearindRad) / Math.cos(deg2rad(absoluteLat)) / 111;
    const absoluteLong = volcanoX + longDiff;

    return {x: absoluteLong, y: absoluteLat};
};

export const LatLngToLocal = (point: Ipoint, volcanoPos: Ipoint,): Ipoint => {
    const volcanoX = volcanoPos.x;
    const volcanoY = volcanoPos.y;
    const yDist = getDistanceFromLatLonInKm({x: volcanoX, y: volcanoY}, {x: point.x, y: volcanoY});
    const xDist = getDistanceFromLatLonInKm({x: volcanoX, y: volcanoY}, {x: volcanoX, y: point.y});

    return {x: xDist, y: yDist};
};

export const getDistanceFromLatLonInKm = (point1: Ipoint, point2: Ipoint): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(point2.y - point1.y);  // deg2rad below
    const dLon = deg2rad(point2.x - point1.x);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(point1.y)) * Math.cos(deg2rad(point2.y)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};
