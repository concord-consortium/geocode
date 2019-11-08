
import { simulation, SimulationModelType } from "./simulation-store";
import { uiStore, UIModelType } from "./ui-store";

export interface IStore {
  simulation: SimulationModelType;
  uiStore: UIModelType;
}

export interface IStoreish {simulation: any; uiStore: any; }

export const stores = {
  simulation,
  uiStore
};

// this tuple syntx allows us to declare an array of strings and a type based on
// that array at the same time.
const tuple = <T extends string[]>(...args: T) => args;

const simulationAuthorSettingsProps = tuple(
  "requireEruption",
  "requirePainting",
  "scenario",
  "toolbox",
  "initialCodeTitle",
);

const uiAuthorSettingsProps = tuple(
  "showBlocks",
  "showCode",
  "showControls",
  "showWindSpeed",
  "showWindDirection",
  "showEjectedVolume",
  "showColumnHeight",
  "showVEI",
  "showChart",
  "showSidebar",
  "showCrossSection",
  "showLog",
);

export type SimulationAuthorSettingsProps = typeof simulationAuthorSettingsProps[number];
export type UIAuthorSettingsProps = typeof uiAuthorSettingsProps[number];

export type SimulationAuthorSettings = {
  [key in SimulationAuthorSettingsProps]?: any;
};
export type UIAuthorSettings = {
  [key in UIAuthorSettingsProps]?: any;
};

// picks props into a new object given an array of keys
const pick = (keys: string[]) => (o: any) => keys.reduce((a, e) => ({ ...a, [e]: o[e] }), {});

// gets the current stores state in a version appropriate for the authoring menu
export function getAuthorableSettings(): IStoreish {
  const authoredSimulation = pick(simulationAuthorSettingsProps)(simulation);
  const authoredUi = pick(uiAuthorSettingsProps)(uiStore);
  return {
    simulation: authoredSimulation,
    uiStore: authoredUi
  };
}

export function updateStores(state: IStoreish) {
  const simulationStoreSettings: SimulationAuthorSettings = pick(simulationAuthorSettingsProps)(state.simulation);
  const uiStoreSettings: UIAuthorSettings = pick(uiAuthorSettingsProps)(state.uiStore);

  simulation.loadAuthorSettingsData(simulationStoreSettings);
  uiStore.loadAuthorSettingsData(uiStoreSettings);
}
