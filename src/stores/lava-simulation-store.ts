import { types } from "mobx-state-tree";

export const LavaSimulationStore = types
  .model("lavaSimulation", {
    ventEasting: 232214,
    ventNorthing: 2158722,
    residual: 5,
    totalVolume: 200000000,
    pulseVolume: 100000, // Standard for small eruption
    lavaElevations: types.array(types.number),
  });
export const lavaSimulation = LavaSimulationStore.create({});

export type LavaSimulationModelType = typeof LavaSimulationStore.Type;
