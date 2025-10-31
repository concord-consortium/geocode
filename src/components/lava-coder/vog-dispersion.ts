import konaWindData from "../../assets/lava-coder/wind-patterns/kona_winds.json";
import tradeWindData from "../../assets/lava-coder/wind-patterns/trade_winds.json";
import { convertLongitudeToX, convertLatitudeToY } from "../../utilities/molasses-utils";
import { WindPattern } from "./lava-coder-types";
import { rangeLat, rangeLong } from "./lava-constants";
import { AsciiRaster } from "./parse-ascii-raster";

interface VogParticle {
  latitude: number;
  longitude: number;
  u: number;
  v: number;
}

let particles: VogParticle[] = [];

const timePerPulse = .0003;
const msPerStep = 30;

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
  let pulseCount = 0;
  // logVolume is between 6 and 10
  const logVolume = Math.log10(totalVolume);
  console.log(`--- logVolume`, logVolume);
  const totalParticles = Math.floor(2000 * logVolume);
  const particlesPerPulse = Math.max(1, Math.floor(totalParticles / pulses));
  console.log(` -- particlesPerPulse`, particlesPerPulse);
  const dispersionFactor = (logVolume - 2) / 4;
  const halfDispersionFactor = dispersionFactor / 2;
  console.log(` -- dispersionFactor`, dispersionFactor);

  // Set up wind data
  const windData = windPattern === "trade" ? tradeWindData : konaWindData;
  const windColumns = windData.lats.length;
  const windMinLat = windData.lats[0];
  const windMaxLat = windData.lats[windColumns - 1];
  const windRangeLat = windMaxLat - windMinLat;
  const windRows = windData.lons.length;
  const windMinLong = windData.lons[0];
  const windMaxLong = windData.lons[windRows - 1];
  const windRangeLong = windMaxLong - windMinLong;
  const windLatStep = windRangeLat / (windColumns - 1);
  const windLongStep = windRangeLong / (windRows - 1);

  function getWindAt(latitude: number, longitude: number) {
    const latIndex = Math.min(
      windColumns - 1,
      Math.max(0, Math.round((latitude - windMinLat) / windLatStep))
    );
    const longIndex = Math.min(
      windRows - 1,
      Math.max(0, Math.round((longitude - windMinLong) / windLongStep))
    );
    return windData.grid[latIndex][longIndex];
  }

  // Set up the grid
  const grid: number[][] = [];
  const latPerCell = rangeLat / raster.header.nrows;
  const longPerCell = rangeLong / raster.header.ncols;
  for (let lat = windMinLat; lat <= windMaxLat; lat += latPerCell) {
    const gridRow: number[] = [];
    for (let long = windMinLong; long <= windMaxLong; long += longPerCell) {
      gridRow.push(0);
    }
    grid.push(gridRow);
  }

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
    const y = convertLatitudeToY(lat, raster);
    const x = convertLongitudeToX(long, raster);
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
      return;
    }

    grid[y][x] += delta;

    vogRange.east = Math.min(windMaxLong, Math.max(vogRange.east, long));
    vogRange.north = Math.min(windMaxLat, Math.max(vogRange.north, lat));
    vogRange.south = Math.max(windMinLat, Math.min(vogRange.south, lat));
    vogRange.west = Math.max(windMinLong, Math.min(vogRange.west, long));

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
    const stepEndTime = Date.now() + msPerStep;

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
      // particle.u *= 0.995;
      // particle.v *= 0.995;

      while (Date.now() < stepEndTime) {
        // Noop
      }
    }
  };

  while (pulseCount < pulses) {
    disperseVogStep();
    sendUpdateMessage();
    pulseCount++;
  }

  sendUpdateMessage(true);
}
