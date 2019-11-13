// Calculate the tephra mass loading in cross section
// Chuck Connor  & Noah Paessel 2/2019
// using tephra2 algorthim (equation of Lim et al. (2008))
import { rotateGridPoint } from "./utilities/grid-transform";
import { Ipoint } from "./interfaces";

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

const gridTephraCalc2 = (
  gridX: number,
  gridY: number,
  coneGridX: number,
  coneGridY: number,
  windSpeed: number,
  windDirectionFromNorth: number,
  colHeight: number,
  mass: number,         // total eruption mass 0 to 1e12 kg (about 1 km3)
  // particleSize given a default value to make it easier to compare with gridTephraCalc3
  particleSize = 1  // Made up number. 1 == actual simulation values (mg?)
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
  const modelX = gridX * dScale;
  const modelY = gridY * dScale;
  const coneX = coneGridX * dScale;
  const coneY = coneGridY * dScale;
  const windDirectionTowardsNorth = windDirectionFromNorth + 180;
  const rotated = rotateGridPoint({x: modelX, y: modelY}, (360 - windDirectionTowardsNorth) + 90, {x: coneX, y: coneY});
  return tephraCalc2(
    rotated.x, rotated.y,
    coneX, coneY,
    windSpeed, mass,
    colHeight, settlingSpeed, diffusion);
};

//
// +++++++++++++++ tephraCalc 3 +++++++++++++++
//
// from the Python code Tephra_code_RC_Oct29_19 by Robert Constantinescu Oct 29, 2019
//
// The above TephraCalc and TephraCalc2 functions are for historical purposes only

// the following constants are reasonable values that may be changed for speed vs. accuracy
const kDiskRadius = 10000;
const kDiskGridSize = 3000;
const kNumSimulatedPhiClasses = 7;   // 7 or 15, or you'll need to pre-calculate more massFractions
// the following constants should not be changed
const g = 9.81;             // gravitational constant m*s^-2
const airVisc = 1.8325e-5;  // air viscosity in N s / m^2 at 24C
const phiF = 11;            // minimum possible grain size
const phiC = -7;            // maximum possible grain size
const rhoPMin = 1000;       // minimum particle density Kg*m^-3
const rhoPMax = 1000;       // maximum particle density Kg*m^-3
const rhoAS = 1.225;        // air density at sea level in Kg*m^-3
const diffusionCoeff = 10000;
const bulkDensity = 1000;

// get the fraction of total mass for each phi class.
// in the original Python code, there are a number of steps involving Cumulative Distribution Functions
// and calculating errors. However, it uses constants from the Pululagua deposit data (`TGSD_MEAN = 0.82` and
// `TGSD_SIGMA = 2.31`), so this just skips those calculation and hard-codes the fractions.
// Because we may want to run with higher or lower accuracy, two diffferent class sets are precalculated.
const massFractions: {[numClasses: number]: {[phi: number]: number}} = {
  15: {
    "-7": 0.0013075815496227702,
    "-6": 0.0043861789924191799,
    "-5": 0.012673087259391388,
    "-4": 0.03071969494565081,
    "-3": 0.062074942264776473,
    "-2": 0.10438543324264346,
    "-1": 0.14600553849188155,
    "0": 0.16983851797872421,
    "1": 0.16429378608137837,
    "2": 0.13216848934269601,
    "3": 0.088427703312089517,
    "4": 0.049215967502196173,
    "5": 0.022804289062452607,
    "6": 0.0088205776976134926,
    "7": 0.0028782122764640389,
  },
  7: {
    "-3": 0.081047169305606515,
    "-2": 0.1233576602834735,
    "-1": 0.1649777655327116,
    "0": 0.18881074501955425,
    "1": 0.18326601312220842,
    "2": 0.15114071638352605,
    "3": 0.10739993035291956,
  }
};

// simple memoizer. This shaves off a couple hundred ms when simulating more phi
// classes or smaller disk cell size
function memo<R, T extends (...args: any[]) => R>(f: T): T {
  const memory = new Map<string, R>();

  const memoized = (...args: any[]) => {
      if (!memory.get(args.join())) {
          memory.set(args.join(), f(...args));
      }

      return memory.get(args.join());
  };

  return memoized as T;
}

const squaredDistance = (p1: Ipoint, p2: Ipoint) => ((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2);

// returns an array of {x,y} points forming the eruption grid centered at xvent, yvent
// memoized as we will frequently be calling this with the same values
export const getEruptionDiskGrid = memo((xVent, yVent, diskRadius, diskGridSize) => {
  const radiusSquared = diskRadius ** 2;
  const halfCellSize = diskGridSize / 2;
  const center = {x: xVent, y: yVent};
  const grid: Ipoint[] = [];
  for (let i = 0; i < 2 * diskRadius; i += diskGridSize) {
    for (let j = 0; j < 2 * diskRadius; j += diskGridSize) {
      const cell = {
        x: xVent - diskRadius + i + halfCellSize,
        y: yVent - diskRadius + j + halfCellSize
      };
      if (squaredDistance(center, cell) < radiusSquared) {
        grid.push(cell);
      }
    }
  }
  return grid;
});

const getDensity = memo((phi: number) => {
  if (phi <= phiC) {
    return rhoPMin;
  } else if (phi >= phiF) {
    return rhoPMax;
  } else {
    const proportion = ((rhoPMax - rhoPMin) * (phi - phiF)) / (phiC - phiF);    // linear proportion
    return rhoPMax - proportion;
  }
});

/** returns diameter in m */
const getDiameter = (phi: number) => 2 ** (-1 * phi) * 10 ** -3;
// returns phi given a diameter in mm
const getPhi = (diameterMM: number) => (Math.log(1 / (125 * (diameterMM / 1000))) / Math.log(2)) - 3;  // solved for phi

/**
 * @param phi Phi class (particle size)
 * @param colHeight Column height in meters
 */
export const getSettlingSpeed = memo((phi: number, colHeight: number) => {
  const atmLayerThickness = 500;
  if (colHeight < atmLayerThickness) {
    console.error(`colHeight must be >= ${atmLayerThickness} (was called with ${colHeight})`);
  }
  const adjustedColHeight = Math.max(colHeight, atmLayerThickness);

  let vAux = 0;
  let vLayer = 0;

  for (let layer = atmLayerThickness; layer < adjustedColHeight + atmLayerThickness; layer += atmLayerThickness) {
    const elev = adjustedColHeight - layer;
    const rhoA = rhoAS * Math.exp(-1 * elev / 8200);
    const rho = getDensity(phi) - rhoA;

    const diameter = getDiameter(phi);

    const vL = (g * diameter ** 2 * rho) / (18 * airVisc);
    const vI = diameter * ((4 * g ** 2 * rho ** 2) / (225 * airVisc * rhoA)) ** (1 / 3);
    const vT = ((3.1 * rho * g * diameter) / (rhoA)) ** 0.5;

    const reL = (diameter * rhoA * vL) / airVisc;
    // const reI = (diameter * rhoA * vI) / airVisc;
    const reT = (diameter * rhoA * vT) / airVisc;

    if (reL < 6) {
      vLayer = vL;
    } else if (reT >= 500) {
      vLayer = vT;
    } else {
      vLayer = vI;
    }

    if (vLayer === vAux) {
      break;
    }
    vAux = vLayer;
  }

  return vLayer;
});

// calculates the tephra deposit on one x,y cell, from a single cell in the eruption disk
const tephraLoadFromDiskCell = (
  x: number,
  y: number,
  xEruption: number,        // one cell of the eruption disk
  yEruption: number,        //
  windSpeed: number,
  mass: number,
  colHeight: number,        // column height in meters
  settlingSpeed: number
  ) => {
  const sourceTerm = (settlingSpeed * mass) / (4 * Math.PI * colHeight * diffusionCoeff);
  const denom = 4 * diffusionCoeff * (colHeight / settlingSpeed);
  const advection = (x - (xEruption + windSpeed * colHeight / settlingSpeed)) ** 2 / denom;
  const diffusion = (y - yEruption) ** 2 / denom;

  return sourceTerm * Math.exp(-advection - diffusion);
};

/**
 * Returns the tephra thickness (cm) at an x, y location, given an eruption centered on
 * xVent, yVent, with the other properties.
 */
const tephraCalc3 = (
  x: number,
  y: number,
  xVent: number,        // center of the eruption
  yVent: number,        //
  windSpeed: number,
  mass: number,         // kg
  colHeight: number,    // column height in meters
  diskRadius: number,
  diskGridSize: number,
  numPhiClasses: number
  ) => {
  const diskGrid = getEruptionDiskGrid(xVent, yVent, diskRadius, diskGridSize);
  const cellMass = mass / diskGrid.length;     // mass per eruption cell
  let totalLoad = 0;
  const simulatedPhiClasses = Object.keys(massFractions[numPhiClasses]).map(Number);
  simulatedPhiClasses.forEach(phi => {
    const phiCellMass = cellMass * massFractions[numPhiClasses][phi];
    const settlingSpeed = getSettlingSpeed(phi, colHeight);
    diskGrid.forEach(diskCell => {
      const load = tephraLoadFromDiskCell(
        x, y, diskCell.x, diskCell.y, windSpeed, phiCellMass, colHeight, settlingSpeed);
      totalLoad += load;
    });
  });
  const tephraTickeness = (totalLoad / bulkDensity) * 100;
  return tephraTickeness;
};

/**
 * This is the main fuction that is called by the application. It calculates the tephra thickness
 * at a grid coordinate (gridX, gridY), given the center of an eruption at (ventGridX, ventGridY),
 * assuming a 1km grid cell size, with the other paramters.
 *
 * *START HERE*
 * It can be a little hard to follow the simulation code...
 * This function takes grid coordinates, scales for the grid size, and rotates to adjust for the wind
 * direction.
 * It then calls `tephraCalc3`, which takes real distance in meters for the location, and assumes a
 * wind due South.
 * `tephraCalc3` then models the tephra as initially erupting as a large disk of various particle sizes,
 * and iteratively calls `tephraLoadFromDiskCell` for each cell in the eruption grid, for each phi class
 * (particle size).
 *
 * @param gridX x coordinate of grid cell we want to measure
 * @param gridY y coordinate of grid cell
 * @param ventGridX x coordinate of volcano
 * @param ventGridY y coordinate of volcano
 * @param windSpeed Wind speed in m/s
 * @param windDirectionFromNorth Direction in deg
 * @param colHeight Column height in m
 * @param mass Eruption mass in kg. 0 to 1e12 kg (about 1 km3)
 * @param [diskRadius=10000] Size of eruption disk
 * @param [diskGridSize=1000] Cell size to model the eruption disk (larger = fewer calculations)
 * @param [simulatedPhiClasses] Array of phi classes (particle sizes) to integrate
 * @returns Tephra thickness in cm
 */
const gridTephraCalc3 = (
  gridX: number,
  gridY: number,
  ventGridX: number,
  ventGridY: number,
  windSpeed: number,
  windDirectionFromNorth: number,
  colHeight: number,
  mass: number,
  diskRadius = kDiskRadius,
  diskGridSize = kDiskGridSize,
  numPhiClasses = kNumSimulatedPhiClasses
  ) => {
  const dScale = 1000; // 1 km per grid cell.
  const modelX = gridX * dScale;
  const modelY = gridY * dScale;
  const ventX = ventGridX * dScale;
  const ventY = ventGridY * dScale;
  const windDirectionTowardsNorth = windDirectionFromNorth + 180;
  const rotated = rotateGridPoint({x: modelX, y: modelY}, (360 - windDirectionTowardsNorth), {x: ventX, y: ventY});

  return tephraCalc3(
    rotated.x, rotated.y,
    ventX, ventY,
    windSpeed, mass,
    colHeight,
    diskRadius, diskGridSize,
    numPhiClasses);
};

export default gridTephraCalc3;

// useful function for getting data from the browser console

// (window as any).runSim = (mass: number, colHeight: number, windSpeed: number,
//                           diskGridSize: number, simulationPhiClasses: number) => {
//   const xs: number[] = [];
//   const res: number[] = [];
//   for (let x = 0; x < 96900; x += 5100) {
//     xs.push(x);
//     res.push(gridTephraCalc3(
//       x / 1000, 0,
//       0, 0,
//       windSpeed, 0,
//       colHeight, mass, 10000, diskGridSize, simulationPhiClasses
//     ));
//   }
//   console.log(JSON.stringify(res));
// };
