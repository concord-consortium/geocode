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
        {y: 0, expectedThickness: 10.45358},
        {y: 51000, expectedThickness: 0.1209},
        {y: 102000, expectedThickness: 0.0003},
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
        );

        expect(tephraThickness).toBeCloseTo(test.expectedThickness);
      });
    });

    it("for high mass, no wind", () => {
      const tephraThicknessData = [
        {y: 0, expectedThickness: 52.2679},
        {y: 51000, expectedThickness: 0.604503},
        {y: 102000, expectedThickness: 0.0016},
        {y: 153000, expectedThickness: 0},
        {y: 204000, expectedThickness: 0}
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
        );

        expect(tephraThickness).toBeCloseTo(test.expectedThickness);
      });
    });

    it("for low mass with wind", () => {
      const tephraThicknessData = [
        {y: 0, expectedThickness: 2.72188},
        {y: 5100, expectedThickness: 4.5620},
        {y: 51000, expectedThickness: 1.7795},
        {y: 102000, expectedThickness: 0.8706},
        {y: 153000, expectedThickness: 0.4290},
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
        );

        expect(tephraThickness).toBeCloseTo(test.expectedThickness);
      });
    });
  });
});
