// Calculate the tephra mass loading in cross section
// Chuck Connor  & Noah Paessel 2/2019
// using tephra2 algorthim (equation of Lim et al. (2008))

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

const gridTephraCalc = (
  gridX: number,
  gridY: number,
  coneGridX: number,
  coneGridY: number,
  windSpeed: number,
  colHeight: number,
  mass: number,         // total eruption mass 0 to 1e12 kg (about 1 km3)
  particleSize: number  // Made up number. 1 == actual simulation values (mg?)
  ) => {

  const dScale = 1000; // 1 km per grid cell.

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
  /*
    TODO:
      * Rotate for vectors for wind direction …
      * Read simulation date from sliders.
  */
  const modelX = gridX * dScale;
  const modelY = gridY * dScale;
  const coneX = coneGridX * dScale;
  const coneY = coneGridY * dScale;
  return tephraCalc(
    modelX, modelY,
    coneX, coneY,
    windSpeed, mass,
    colHeight, settlingSpeed, diffusion);
};

export default gridTephraCalc;
