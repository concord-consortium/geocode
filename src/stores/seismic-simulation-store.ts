import { types } from "mobx-state-tree";

export const SeismicSimulationStore = types
  .model("seismicSimulation", {
    scenario: "Seismic CA",
  });
export const seismicSimulation = SeismicSimulationStore.create({});

export type SeismicSimulationModelType = typeof SeismicSimulationStore.Type;
