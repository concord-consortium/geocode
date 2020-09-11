import { types } from "mobx-state-tree";

const minLat = 32;
const maxLat = 42;
const minLng = -127;
const maxLng = -115;

export const DeformationSimulationStore = types
  .model("deformationSimulation", {
    scenario: "Deformation CA"
  })
  .actions((self) => ({
  }))
  .views((self) => ({
  }));

export const deformationSimulation = DeformationSimulationStore.create({});

export type DeformationSimulationModelType = typeof DeformationSimulationStore.Type;
