import { types } from "mobx-state-tree";

export const SeismicSimulationStore = types
  .model("seismicSimulation", {
    gpsStations: types.array(types.number)
  });
export const seismicSimulation = SeismicSimulationStore.create({});

export type SeismicSimulationModelType = typeof SeismicSimulationStore.Type;
