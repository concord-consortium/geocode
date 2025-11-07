import { WindPattern } from "../../types/lava-coder/lava-coder-types";
import { getWindData } from "../../utilities/vog-utilities";
import { rangeLat, rangeLong } from "./lava-constants";
import { AsciiRaster } from "./parse-ascii-raster";

interface VogParticle {
  latitude: number;
  longitude: number;
  u: number;
  v: number;
}

let particles: VogParticle[] = [];

const timePerPulse = .0002;
const msPerStep = 25;

export interface VogSimulationParameters {
  postMessage: (message: any) => void;
  pulses: number;
  raster: AsciiRaster;
  totalVolume: number;
  ventLatitude: number;
  ventLongitude: number;
  windPattern: WindPattern;
}
export async function disperseVog({
  postMessage, pulses, raster, totalVolume, ventLatitude, ventLongitude, windPattern
}: VogSimulationParameters) {
  particles = [];
  const vogPulses = 2 * pulses;
  let pulseCount = 0;
  // logVolume is between 6 and 10
  const logVolume = Math.log10(totalVolume);
  const totalParticles = Math.floor(4000 * logVolume);
  const particlesPerPulse = Math.max(1, Math.floor(totalParticles / vogPulses));
  // dispersionFactor is between 1 and 2
  const dispersionFactor = (logVolume - 2) / 4;
  const halfDispersionFactor = dispersionFactor / 2;

  const { columns, data, maxLat, maxLon, minLat, minLon, stepLat, stepLon, rows } = getWindData(windPattern);

  function getWindAt(latitude: number, longitude: number) {
    const latIndex = Math.min(
      columns - 1,
      Math.max(0, Math.round((latitude - minLat) / stepLat))
    );
    const longIndex = Math.min(
      rows - 1,
      Math.max(0, Math.round((longitude - minLon) / stepLon))
    );

    // Interpolate between the four surrounding wind values
    const baseWind = data.grid[latIndex][longIndex];
    const rightWind = data.grid[latIndex][longIndex + 1] ?? baseWind;
    const downWind = data.grid[latIndex + 1]?.[longIndex] ?? baseWind;
    const diagWind = data.grid[latIndex + 1]?.[longIndex + 1] ?? baseWind;

    const latFraction = (latitude - (minLat + latIndex * stepLat)) / stepLat;
    const longFraction = (longitude - (minLon + longIndex * stepLon)) / stepLon;

    const topU = baseWind[0] + (rightWind[0] - baseWind[0]) * longFraction;
    const topV = baseWind[1] + (rightWind[1] - baseWind[1]) * longFraction;
    const bottomU = downWind[0] + (diagWind[0] - downWind[0]) * longFraction;
    const bottomV = downWind[1] + (diagWind[1] - downWind[1]) * longFraction;
    const u = topU + (bottomU - topU) * latFraction;
    const v = topV + (bottomV - topV) * latFraction;

    return [u, v];
  }

  // Set up the grid
  // Note that the grid has the same size cells as the lava raster, which is different than the wind data
  const grid: number[][] = [];
  const latPerCell = rangeLat / raster.header.nrows;
  const longPerCell = rangeLong / raster.header.ncols;
  for (let lat = minLat; lat <= maxLat; lat += latPerCell) {
    const gridRow: number[] = [];
    for (let long = minLon; long <= maxLon; long += longPerCell) {
      gridRow.push(0);
    }
    grid.push(gridRow);
  }
  const gridRows = grid.length;
  const gridCols = grid[0].length;
  const convertLatitudeToY =
    (latitude: number) => gridRows - Math.floor((latitude - minLat) / (maxLat - minLat) * gridRows);
  const convertLongitudeToX = (longitude: number) => Math.floor((longitude - minLon) / (maxLon - minLon) * gridCols);

  // The range of the rectangle containing vog particles in lat/long.
  const vogRange = {
    east: -Infinity,
    north: -Infinity,
    south: Infinity,
    west: Infinity
  };
  // The range of the rectangle containing cells with vog particles.
  // Note that north is lower than south in the grid.
  const vogGridRange = {
    east: -Infinity,
    north: Infinity,
    south: -Infinity,
    west: Infinity
  };

  // Increase or decrease the number of particles at a location and expand the ranges to contain that location
  const updateVogGrid = (delta: number, lat: number, long: number) => {
    const y = convertLatitudeToY(lat);
    const x = convertLongitudeToX(long);
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
      return;
    }

    grid[y][x] += delta;

    vogRange.east = Math.min(maxLon, Math.max(vogRange.east, long));
    vogRange.north = Math.min(maxLat, Math.max(vogRange.north, lat));
    vogRange.south = Math.max(minLat, Math.min(vogRange.south, lat));
    vogRange.west = Math.max(minLon, Math.min(vogRange.west, long));

    vogGridRange.east = Math.min(grid[0].length - 1, Math.max(vogGridRange.east, x));
    vogGridRange.north = Math.max(0, Math.min(vogGridRange.north, y));
    vogGridRange.south = Math.min(grid.length - 1, Math.max(vogGridRange.south, y));
    vogGridRange.west = Math.max(0, Math.min(vogGridRange.west, x));
  };
  
  const sendUpdateMessage = (complete = false) => {
    const vogConcentrationGrid: number[][] = [];
    for (let y = vogGridRange.north; y <= vogGridRange.south; y++) {
      if (y < 0 || y >= grid.length) continue; // Skip rows outside the grid bounds
      const vogRow: number[] = [];
      for (let x = vogGridRange.west; x <= vogGridRange.east; x++) {
        if (x < 0 || x >= grid[y].length) continue; // Skip columns outside the grid bounds
        vogRow.push(grid[y][x]);
      }
      vogConcentrationGrid.push(vogRow);
    }

    postMessage({
      status: "updatedVog",
      complete,
      grid: vogConcentrationGrid,
      gridBounds: vogRange
    });
  };

  const disperseVogStep = () => {
    // Add new vog
    for (let i = 0; i < particlesPerPulse; i++) {
      const u = Math.random() * dispersionFactor - halfDispersionFactor;
      const v = Math.random() * dispersionFactor - halfDispersionFactor;
      particles.push({ latitude: ventLatitude, longitude: ventLongitude, u, v });
      updateVogGrid(1, ventLatitude, ventLongitude);
    }

    // Update vog
    for (const particle of particles) {
      // Determine particle position assuming constant wind at current location's velocity
      const [uWind, vWind] = getWindAt(particle.latitude, particle.longitude);
      const selfDU = particle.u * timePerPulse;
      const selfDV = particle.v * timePerPulse;
      const projectedLat = particle.latitude + (vWind * timePerPulse) + selfDV;
      const projectedLong = particle.longitude + (uWind * timePerPulse) + selfDU;

      // Use average wind at current and projected location to determine actual new position
      const [projectedU, projectedV] = getWindAt(projectedLat, projectedLong);
      const averageU = (uWind + projectedU) / 2;
      const averageV = (vWind + projectedV) / 2;
      const newLatitude = particle.latitude + (averageV * timePerPulse) + selfDV;
      const newLongitude = particle.longitude + (averageU * timePerPulse) + selfDU;

      // Remove particle from old position in concentration grid
      updateVogGrid(-1, particle.latitude, particle.longitude);

      // Update particle position
      particle.latitude = newLatitude;
      particle.longitude = newLongitude;

      // Add particle to new position in concentration grid
      updateVogGrid(1, newLatitude, newLongitude);

      // Decay unique particle velocity
      particle.u *= 0.999;
      particle.v *= 0.999;
    }

    sendUpdateMessage();
  };

  while (pulseCount < vogPulses) {
    const stepEndTime = Date.now() + msPerStep;
    
    disperseVogStep();
    pulseCount++;

    // Delay to make sure the wind dispersion animates at a reasonable speed
    while (Date.now() < stepEndTime) {
      // Noop
    }
  }

  sendUpdateMessage(true);
}
