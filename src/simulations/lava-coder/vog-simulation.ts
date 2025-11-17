import { WindPattern } from "../../types/lava-coder/lava-coder-types";
import { getWindData, WindData } from "../../utilities/vog-utilities";
import { rangeLat, rangeLong } from "./lava-constants";
import { AsciiRaster } from "./parse-ascii-raster";

interface VogParticle {
  age: number;
  alive: boolean;
  latitude: number;
  longitude: number;
  u: number;
  v: number;
}

const timePerPulse = .0002;
const msPerStep = 25;

export interface VogSimulationParameters {
  pulses: number;
  raster: AsciiRaster;
  totalVolume: number;
  ventLatitude: number;
  ventLongitude: number;
  windPattern: WindPattern;
}
export class VogSimulation {
  private particles: VogParticle[] = [];
  private grid: number[][] = [];
  private phase: "creation" | "dispersion" = "creation";

  private ventLatitude: number;
  private ventLongitude: number;
  private windData: WindData;

  private particleLifespan = Infinity;
  private timePerPulse: number;
  private vogPulses: number;
  private particlesPerPulse: number;
  private dispersionFactor: number;
  private halfDispersionFactor: number;

  // The range of the rectangle containing vog particles in lat/long.
  private vogRange = {
    east: -Infinity,
    north: -Infinity,
    south: Infinity,
    west: Infinity
  };
  // The range of the rectangle containing cells with vog particles.
  // Note that north is lower than south in the grid.
  private vogGridRange = {
    east: -Infinity,
    north: Infinity,
    south: -Infinity,
    west: Infinity
  };

  constructor({ pulses, raster, totalVolume, ventLatitude, ventLongitude, windPattern }: VogSimulationParameters) {
    this.ventLatitude = ventLatitude;
    this.ventLongitude = ventLongitude;
    this.windData = getWindData(windPattern);
  
    // Set up simulation
    this.vogPulses = 2 * pulses;
    this.particleLifespan = this.vogPulses;
    // logVolume is between 6 and 10
    const logVolume = Math.log10(totalVolume);
    this.timePerPulse = timePerPulse * logVolume / 10;
    const totalParticles = Math.floor(4000 * logVolume);
    this.particlesPerPulse = Math.max(1, Math.floor(totalParticles / this.vogPulses));
    // dispersionFactor is between 1 and 2
    this.dispersionFactor = (logVolume - 2) / 4;
    this.halfDispersionFactor = this.dispersionFactor / 2;

    // Set up the grid
    // Note that the grid has the same size cells as the lava raster, which is different than the wind data
    const latPerCell = rangeLat / raster.header.nrows;
    const longPerCell = rangeLong / raster.header.ncols;
    for (let lat = this.windData.minLat; lat <= this.windData.maxLat; lat += latPerCell) {
      const gridRow: number[] = [];
      for (let long = this.windData.minLon; long <= this.windData.maxLon; long += longPerCell) {
        gridRow.push(0);
      }
      this.grid.push(gridRow);
    }
  }
  
  private getWindAt(latitude: number, longitude: number) {
    const latIndex = Math.min(
      this.windData.columns - 1,
      Math.max(0, Math.round((latitude - this.windData.minLat) / this.windData.stepLat))
    );
    const longIndex = Math.min(
      this.windData.rows - 1,
      Math.max(0, Math.round((longitude - this.windData.minLon) / this.windData.stepLon))
    );

    // Interpolate between the four surrounding wind values
    const baseWind = this.windData.data.grid[latIndex][longIndex];
    const rightWind = this.windData.data.grid[latIndex][longIndex + 1] ?? baseWind;
    const downWind = this.windData.data.grid[latIndex + 1]?.[longIndex] ?? baseWind;
    const diagWind = this.windData.data.grid[latIndex + 1]?.[longIndex + 1] ?? baseWind;

    const latFraction = (latitude - (this.windData.minLat + latIndex * this.windData.stepLat)) / this.windData.stepLat;
    const longFraction =
      (longitude - (this.windData.minLon + longIndex * this.windData.stepLon)) / this.windData.stepLon;

    const topU = baseWind[0] + (rightWind[0] - baseWind[0]) * longFraction;
    const topV = baseWind[1] + (rightWind[1] - baseWind[1]) * longFraction;
    const bottomU = downWind[0] + (diagWind[0] - downWind[0]) * longFraction;
    const bottomV = downWind[1] + (diagWind[1] - downWind[1]) * longFraction;
    const u = topU + (bottomU - topU) * latFraction;
    const v = topV + (bottomV - topV) * latFraction;

    return [u, v];
  }

  private convertLatitudeToY(latitude: number) {
    const gridRows = this.grid.length;
    const { minLat } = this.windData;
    return gridRows - Math.floor((latitude - minLat) / (this.windData.maxLat - minLat) * gridRows);
  }

  private convertLongitudeToX(longitude: number) {
    const gridCols = this.grid[0].length;
    const { maxLon, minLon } = this.windData;
    return Math.floor((longitude - minLon) / (maxLon - minLon) * gridCols);
  }

  // Increase or decrease the number of particles at a location and expand the ranges to contain that location
  private updateVogGrid(delta: number, lat: number, long: number) {
    const y = this.convertLatitudeToY(lat);
    const x = this.convertLongitudeToX(long);
    if (y < 0 || y >= this.grid.length || x < 0 || x >= this.grid[0].length) return;

    this.grid[y][x] += delta;

    const { maxLat, maxLon, minLat, minLon } = this.windData;
    this.vogRange.east = Math.min(maxLon, Math.max(this.vogRange.east, long));
    this.vogRange.north = Math.min(maxLat, Math.max(this.vogRange.north, lat));
    this.vogRange.south = Math.max(minLat, Math.min(this.vogRange.south, lat));
    this.vogRange.west = Math.max(minLon, Math.min(this.vogRange.west, long));

    this.vogGridRange.east = Math.min(this.grid[0].length - 1, Math.max(this.vogGridRange.east, x));
    this.vogGridRange.north = Math.max(0, Math.min(this.vogGridRange.north, y));
    this.vogGridRange.south = Math.min(this.grid.length - 1, Math.max(this.vogGridRange.south, y));
    this.vogGridRange.west = Math.max(0, Math.min(this.vogGridRange.west, x));
  }
  
  private sendUpdateMessage(complete = false) {
    const vogConcentrationGrid: number[][] = [];
    for (let y = this.vogGridRange.north; y <= this.vogGridRange.south; y++) {
      if (y < 0 || y >= this.grid.length) continue; // Skip rows outside the grid bounds
      const vogRow: number[] = [];
      for (let x = this.vogGridRange.west; x <= this.vogGridRange.east; x++) {
        if (x < 0 || x >= this.grid[y].length) continue; // Skip columns outside the grid bounds
        vogRow.push(this.grid[y][x]);
      }
      vogConcentrationGrid.push(vogRow);
    }

    postMessage({
      status: "updatedVog",
      complete,
      grid: vogConcentrationGrid,
      gridBounds: this.vogRange
    });
  }

  public stepSimulation(complete = false) {
    // Add new vog
    if (this.phase === "creation") {
      for (let i = 0; i < this.particlesPerPulse; i++) {
        const u = Math.random() * this.dispersionFactor - this.halfDispersionFactor;
        const v = Math.random() * this.dispersionFactor - this.halfDispersionFactor;
        this.particles.push({ age: 0, alive: true, latitude: this.ventLatitude, longitude: this.ventLongitude, u, v });
        this.updateVogGrid(1, this.ventLatitude, this.ventLongitude);
      }
    }

    // Update vog
    for (const particle of this.particles) {
      if (!particle.alive) continue;

      particle.age++;

      // Kill old particles
      if (particle.age > this.particleLifespan) {
        particle.alive = false;
        this.updateVogGrid(-1, particle.latitude, particle.longitude);
        continue;
      }

      // Determine particle position assuming constant wind at current location's velocity
      const [uWind, vWind] = this.getWindAt(particle.latitude, particle.longitude);
      const selfDU = particle.u * this.timePerPulse;
      const selfDV = particle.v * this.timePerPulse;
      const projectedLat = particle.latitude + (vWind * this.timePerPulse) + selfDV;
      const projectedLong = particle.longitude + (uWind * this.timePerPulse) + selfDU;

      // Use average wind at current and projected location to determine actual new position
      const [projectedU, projectedV] = this.getWindAt(projectedLat, projectedLong);
      const averageU = (uWind + projectedU) / 2;
      const averageV = (vWind + projectedV) / 2;
      const newLatitude = particle.latitude + (averageV * this.timePerPulse) + selfDV;
      const newLongitude = particle.longitude + (averageU * this.timePerPulse) + selfDU;

      // Remove particle from old position in concentration grid
      this.updateVogGrid(-1, particle.latitude, particle.longitude);

      // Update particle position
      particle.latitude = newLatitude;
      particle.longitude = newLongitude;

      // Add particle to new position in concentration grid
      this.updateVogGrid(1, newLatitude, newLongitude);

      // Decay unique particle velocity
      particle.u *= 0.999;
      particle.v *= 0.999;
    }

    this.sendUpdateMessage(complete);
  }

  public async runSimulation() {
    let pulseCount = 0;

    while (pulseCount < this.vogPulses) {
      const stepEndTime = Date.now() + msPerStep;

      this.stepSimulation();
      pulseCount++;

      // Switch to dispersion mode once we're finished creating particles
      if (pulseCount >= this.vogPulses && this.phase === "creation") {
        this.setPhase("dispersion");
        pulseCount = 0;
      }

      // Delay to make sure the wind dispersion animates at a reasonable speed
      while (Date.now() < stepEndTime) {
        // Noop
      }
    }

    this.sendUpdateMessage(true);
  }

  public setPhase(phase: "creation" | "dispersion") {
    this.phase = phase;
    if (phase === "dispersion") {
      this.vogPulses = this.vogPulses / 2;
    }
  }
}
