// Calculate the tephra mass loading in cross section
// Chuck Connor  & Noah Paessel 2/2019
// using tephra2 algorthim (equation of Lim et al. (2008))
import { rotateGridPoint } from "./utilities/grid-transform";
const tephraCalc = (
  x: number,
  y: number,
  xvent: number,
  yvent: number,
  windSpeed: number,
  mass: number,
  colHeight: number,
  settlingSpeed: number,
  diffusion: number
  ) => {

  // calculates the mass loading of tephra at a point x,y (meters)
  // from a volcanic vent located at xvent, yvent (m)
  // mass (kg) is released from a height col_ht (m)
  // into a windfield with velocity wind_speed (m/s) blowing toward the positive x direction
  // particles have a settling_speed (m/s) and diffusion (m**2/s)

  // usually for a given isomass map, this function is called
  // multiple times for each x,y, point, for mass fraction
  // releaed from various column heights and with varying settling
  // velocity (which is a function of particle size and the atmosphere)

  const term1 = Math.pow((x - (xvent + windSpeed * colHeight / settlingSpeed)), 2);
  const term2 = Math.pow((y - yvent), 2);
  const term3 = settlingSpeed * mass / (4 * Math.PI * colHeight * diffusion);
  const term4 = 4 * diffusion * colHeight / settlingSpeed;

  return term3 * Math.exp(-term1 / term4 - term2 / term4);
};

// calculates the mass loading of tephra at a point x,y (meters)
// from a volcanic vent located at xvent, yvent (m)
// mass (kg) is released from a height localColHeight (m)
// into a windfield with velocity wind_speed (m/s) blowing toward the positive y direction
// particles have a settling_speed (m/s) and diffusion (m**2/s)
// updated on 2019-04-23
// edited 2019-04-2 from the provided calc to make assume windspeed is in the positive y direction
const tephraCalc2 = (
  x: number,
  y: number,
  xvent: number,
  yvent: number,
  windSpeed: number,
  mass: number,
  colHeight: number,
  settlingSpeed: number,
  diffusion: number
  ) => {

    const colSteps = 100; // use 100 column steps fr the integration (coarse)
    const colInterval = colHeight / colSteps;
    const colMassInterval = mass /  colSteps; // distribute evenly along column

    let term1;
    let term2;
    let term3;
    let term4;

    let localColHeight = 0;
    let masLoading = 0;
    let i;

    // for each height-interval in the eruption column:
    for (i = 1; i <= colSteps; i++){
        localColHeight = i * colInterval;

        term1 = ( y - (yvent + windSpeed * localColHeight / settlingSpeed) );
        term1 = Math.pow(term1, 2);
        term2 = Math.pow(x - xvent, 2);
        term3 = settlingSpeed * colMassInterval / (4 * Math.PI * localColHeight * diffusion);
        term4 = 4 * diffusion * localColHeight / settlingSpeed;
        masLoading += term3 * Math.exp( -term1 / term4 - term2 / term4);
    }

    return masLoading;
};

const gridTephraCalc = (
  gridX: number,
  gridY: number,
  coneGridX: number,
  coneGridY: number,
  windSpeed: number,
  windDirection: number,
  colHeight: number,
  mass: number,         // total eruption mass 0 to 1e12 kg (about 1 km3)
  particleSize: number  // Made up number. 1 == actual simulation values (mg?)
  ) => {

  const dScale = 100; // 1 km per grid cell.

  // MODEL PARAMS:
  // the x axisis oriented in the wind direction (positive downwind)
  // the y axis is orthogonal to the x axis
  // const xvent = 0; // x location of the volcano (m)
  // const yvent = 0; // y location of the volcano (m)
  // const windSpeed = 3;    //  0 to 20 m/s
  // const colHeight = 3000; // varies from 2000 to 25000 m
  // const mass = 5000000000;    // total eruption mass 0 to 1e12 kg (about 1 km3)
  // const settlingSpeed = 2; // particle settling velocity (m/s)
  // const diffusion = 3000;  // 3000 diffusion coefficient (m2/s)

  const settlingSpeed = particleSize * 2;
  const diffusion = 3000 / particleSize;
  const modelX = gridX * dScale;
  const modelY = gridY * dScale;
  const coneX = coneGridX * dScale;
  const coneY = coneGridY * dScale;
  const rotated = rotateGridPoint({x: modelX, y: modelY}, windDirection, {x: coneX, y: coneY});
  return tephraCalc2(
    rotated.x, rotated.y,
    coneX, coneY,
    windSpeed, mass,
    colHeight, settlingSpeed, diffusion);
};

export default gridTephraCalc;
