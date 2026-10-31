// @cesium/engine ships ESM that jest can't parse. The store only uses KmlDataSource (as a
// type, plus entity access that these tests never reach) and CSMath.toRadians, so a local
// stub keeps this scoped to this file rather than changing the repo's jest config.
jest.mock("@cesium/engine", () => ({
  KmlDataSource: class {},
  Math: { toRadians: (degrees: number) => degrees * 3.141592653589793 / 180 }
}));

// url-query wraps query-string, which is esm-only and so can't be loaded by jest. Same reason
// url-settings.test.ts stubs it. Reached here via ui-store.
jest.mock("../utilities/url-query", () => ({
  queryValue: jest.fn(),
  queryValueBoolean: jest.fn(),
  setQueryValue: jest.fn()
}));

import { LavaSimulationStore, LavaSimulationModelType, runFootprints } from "./lava-simulation-store";

describe("lava-simulation-store multirun", () => {
  let sim: LavaSimulationModelType;

  beforeEach(() => {
    sim = LavaSimulationStore.create({});
    // runFootprints is module-level, so it outlives the store instance.
    runFootprints.clear();
  });

  describe("before a program creates a table", () => {
    it("has no table, so the Multirun tab shows its empty state", () => {
      expect(sim.multirunTable).toBeUndefined();
    });

    it("still runs, but records nothing", () => {
      expect(sim.beginRun()).toBeUndefined();
      expect(sim.multirunTable).toBeUndefined();
    });
  });

  describe("once a table exists", () => {
    beforeEach(() => sim.newMultirunTable());

    it("creates an empty table", () => {
      expect(sim.multirunTable?.rows.length).toBe(0);
    });

    it("records a run's parameters when the run STARTS, with no area yet", () => {
      sim.setResidual(10);
      sim.setTotalVolume(150000000);

      const runNumber = sim.beginRun();

      expect(runNumber).toBe(1);
      const row = sim.multirunTable!.row(1)!;
      expect(row.lavaThickness).toBe(10);
      expect(row.eruptionVolume).toBe(150000000);
      expect(row.acresCovered).toBe(0);
      expect(row.complete).toBe(false);
    });

    it("selects the erupting run, so its row and circle read as current", () => {
      const runNumber = sim.beginRun();
      expect(sim.selectedRunNumber).toBe(runNumber);
    });

    it("numbers successive runs sequentially", () => {
      expect(sim.beginRun()).toBe(1);
      sim.completeRun(1);
      expect(sim.beginRun()).toBe(2);
      sim.completeRun(2);
      expect(sim.beginRun()).toBe(3);
    });

    it("finalizes a run on completion", () => {
      sim.beginRun();
      sim.countCoveredCells([[1, 1], [1, 0]]);
      sim.completeRun(1);

      const row = sim.multirunTable!.row(1)!;
      expect(row.complete).toBe(true);
      expect(row.acresCovered).toBeCloseTo(sim.acresCovered);
    });

    it("keeps each run's own parameters as later runs change them", () => {
      sim.setResidual(10);
      sim.beginRun();
      sim.completeRun(1);

      sim.setResidual(42);
      sim.beginRun();
      sim.completeRun(2);

      expect(sim.multirunTable!.row(1)!.lavaThickness).toBe(10);
      expect(sim.multirunTable!.row(2)!.lavaThickness).toBe(42);
    });

    it("ignores completion of a run number that isn't in the table", () => {
      sim.beginRun();
      expect(() => sim.completeRun(99)).not.toThrow();
      expect(sim.multirunTable!.row(1)!.complete).toBe(false);
    });
  });

  describe("clearing", () => {
    beforeEach(() => {
      sim.newMultirunTable();
      sim.beginRun();
      sim.completeRun(1);
    });

    it("clearMultirunTable drops the table entirely, not just its rows", () => {
      sim.clearMultirunTable();
      expect(sim.multirunTable).toBeUndefined();
      expect(sim.selectedRunNumber).toBeUndefined();
      expect(runFootprints.size).toBe(0);
    });

    it("reset() clears the table — Reset and Reload give a clean slate", () => {
      sim.reset();
      expect(sim.multirunTable).toBeUndefined();
      expect(sim.selectedRunNumber).toBeUndefined();
    });
  });

  describe("selection", () => {
    beforeEach(() => {
      sim.newMultirunTable();
      sim.beginRun();
      sim.completeRun(1);
      sim.beginRun();
      sim.completeRun(2);
    });

    it("selecting a run replaces the previous selection", () => {
      sim.setSelectedRunNumber(1);
      expect(sim.selectedRunNumber).toBe(1);
      sim.setSelectedRunNumber(2);
      expect(sim.selectedRunNumber).toBe(2);
    });

    it("can be cleared back to the live view", () => {
      sim.setSelectedRunNumber(1);
      sim.setSelectedRunNumber(undefined);
      expect(sim.selectedRunNumber).toBeUndefined();
    });
  });
});
