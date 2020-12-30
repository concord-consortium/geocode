import { Ipoint } from "./interfaces";
import gridTephraCalc, { getEruptionDiskGrid, getSettlingSpeed } from "./tephra2";

describe("tephra3 calculations", () => {

  it("calculates the disk grid correctly", () => {
    const xvent = 0;
    const yvent = 0;
    const diskRadius = 2;
    const diskGridSize = 1;
    const expectedDiskGrid: Ipoint[] = [
      { x: -1.5, y: -0.5 },
      { x: -1.5, y: 0.5 },
      { x: -0.5, y: -1.5 },
      { x: -0.5, y: -0.5 },
      { x: -0.5, y: 0.5 },
      { x: -0.5, y: 1.5 },
      { x: 0.5, y: -1.5 },
      { x: 0.5, y: -0.5 },
      { x: 0.5, y: 0.5 },
      { x: 0.5, y: 1.5 },
      { x: 1.5, y: -0.5 },
      { x: 1.5, y: 0.5 }];
    const diskGrid = getEruptionDiskGrid(xvent, yvent, diskRadius, diskGridSize);

    expectedDiskGrid.forEach( (cell, i) => {
      const actualCell = diskGrid[i];
      expect(cell.x).toBe(actualCell.x);
      expect(cell.y).toBe(actualCell.y);
    });
  });

  it("calculates the settling speed correctly", () => {
    const settlingSpeedColHeight = 10000;
    // values from particle-velocity.py, given colHeight of 10,000m
    const settlingSpeedData = [
      {phi: -7, expectedSettlingSpeed: 56.33601},
      {phi: -3, expectedSettlingSpeed: 14.08400},
      {phi: 0, expectedSettlingSpeed: 4.23633},
      {phi: 3, expectedSettlingSpeed: 0.46413},
      {phi: 7, expectedSettlingSpeed: 0.00181},
      {phi: 11, expectedSettlingSpeed: 0.00001}
    ];
    settlingSpeedData.forEach( (test) => {
      const settlingSpeed = getSettlingSpeed(test.phi, settlingSpeedColHeight);
      expect(settlingSpeed).toBeCloseTo(test.expectedSettlingSpeed);
    });
  });

  describe("calculates the tephra thickness correctly", () => {

    // the following expected thicknesses are taken directly from the output of the original
    // tephra3 python program, adjusted slightly to fix an error in the original program with
    // the mass fractions.
    // all values, including the original data without the fix, can be seen at
    // https://docs.google.com/spreadsheets/d/12EEJpJAnqk5pMMoa4cdtDSqUv7uiRPIPAGEIev1SJfQ/edit?usp=sharing

    it("for low mass, no wind", () => {
      const tephraThicknessData = [
        {y: 0, expectedThickness: 13.095311},
        {y: 51000, expectedThickness: 0.072006},
        {y: 102000, expectedThickness: 0.007534},
        {y: 153000, expectedThickness: 0.002121},
        {y: 204000, expectedThickness: 0.000829}
      ];

      tephraThicknessData.forEach( (test) => {
        const tephraThickness = gridTephraCalc(
          0,            // test x, y
          test.y / 1000,
          0,            // cone x, y
          0,
          0,            // wind speed
          0,            // wind direction
          20000,        // column height
          1e11,         // eruption mass
          10000,        // disk radius
          1000,         // disk cell size
          15            // num phi classes to model
        );

        expect(tephraThickness).toBeCloseTo(test.expectedThickness);
      });
    });

    it("for high mass, no wind", () => {
      const tephraThicknessData = [
        {y: 0, expectedThickness: 65.476559},
        {y: 51000, expectedThickness: 0.360033},
        {y: 102000, expectedThickness: 0.037672},
        {y: 153000, expectedThickness: 0.010605},
        {y: 204000, expectedThickness: 0.004145}
      ];

      tephraThicknessData.forEach( (test) => {
        const tephraThickness = gridTephraCalc(
          0,            // test x, y
          test.y / 1000,
          0,            // cone x, y
          0,
          0,            // wind speed
          0,            // wind direction
          20000,        // column height
          5e11,         // eruption mass
          10000,        // disk radius
          1000,         // disk cell size
          15            // phi classes to model
        );

        expect(tephraThickness).toBeCloseTo(test.expectedThickness);
      });
    });

    it("for low mass with wind", () => {
      const tephraThicknessData = [
        {y: 0, expectedThickness: 5.51739},
        {y: 5100, expectedThickness: 8.28432},
        {y: 51000, expectedThickness: 1.256186},
        {y: 102000, expectedThickness: 0.367375},
        {y: 153000, expectedThickness: 0.079771},
      ];

      tephraThicknessData.forEach( (test) => {
        const tephraThickness = gridTephraCalc(
          test.y / 1000,            // test x, y
          0,
          0,            // cone x, y
          0,
          -5,            // wind speed
          90,            // wind direction
          20000,        // column height
          1e11,         // eruption mass
          10000,        // disk radius
          1000,         // disk cell size
          15            // phi classes to model
        );

        expect(tephraThickness).toBeCloseTo(test.expectedThickness);
      });
    });
  });
});
