import { TephraSimulationStore, TephraSimulationModelType } from "./tephra-simulation-store";

describe("simulation-store", () => {
  let simulation: TephraSimulationModelType;

  beforeEach(() => {
    simulation = TephraSimulationStore.create({});
  });

  describe("vei", () => {
    it("we can set vei and staging mass and column height will be set", () => {
      simulation.setVEI(1);
      expect(simulation.stagingMass).toBe(1e8);
      expect(simulation.stagingColHeight).toBe(500);

      simulation.setVEI(4);
      expect(simulation.stagingMass).toBe(1e11);
      expect(simulation.stagingColHeight).toBe(10000);

      simulation.setVEI(8);
      expect(simulation.stagingMass).toBe(1e15);
      expect(simulation.stagingColHeight).toBe(25000);
    });

    it("we can set vei and we can read correct vei back", () => {
      for (let vei = 1; vei < 9; vei++) {
        simulation.setVEI(vei);
        expect(simulation.stagingVei).toBe(vei);
      }
    });

    it("we can set mass and height to reasonable values and read correct vei back", () => {
      simulation.setMass(1e8);
      simulation.setColumnHeight(0.5);
      expect(simulation.stagingVei).toBe(1);

      simulation.setMass(1e10);
      simulation.setColumnHeight(5);
      expect(simulation.stagingVei).toBe(3);

      simulation.setMass(1e14);
      simulation.setColumnHeight(25);
      expect(simulation.stagingVei).toBe(7);
    });

    it("we can set mass and height to conflicting values and read a best-guess vei back", () => {
      simulation.setMass(1e8);
      simulation.setColumnHeight(5);
      expect(simulation.stagingVei).toBe(2);

      simulation.setMass(1e8);
      simulation.setColumnHeight(25);
      expect(simulation.stagingVei).toBe(4);

      simulation.setMass(1e14);
      simulation.setColumnHeight(0.5);
      expect(simulation.stagingVei).toBe(4);

      simulation.setMass(1e15);
      simulation.setColumnHeight(0.5);
      expect(simulation.stagingVei).toBe(5);
    });
  });
  describe("overlay controls", () => {
    it("can switch between standard, ruler, cross-section and lat/long tools", () => {
      simulation.rulerClick();
      expect(simulation.isSelectingRuler).toBe(true);
      expect(simulation.isSelectingCrossSection).toBe(false);
      expect(simulation.isSelectingSetRegion).toBe(false);

      simulation.crossSectionClick();
      expect(simulation.isSelectingRuler).toBe(false);
      expect(simulation.isSelectingCrossSection).toBe(true);
      expect(simulation.isSelectingSetRegion).toBe(false);

      simulation.setRegionClick();
      expect(simulation.isSelectingRuler).toBe(false);
      expect(simulation.isSelectingCrossSection).toBe(false);
      expect(simulation.isSelectingSetRegion).toBe(true);
    });
  });
});
