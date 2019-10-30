
import { simulation, SimulationModelType } from "./simulation-store";
import { uiStore, UIModelType } from "./ui-store";

export interface IStore {
  simulation: SimulationModelType;
  uiStore: UIModelType;
}

export const stores = {
  simulation,
  uiStore
};
