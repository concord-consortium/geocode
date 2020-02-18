
import { simulation, SimulationModelType } from "./simulation-store";
import { uiStore, UIModelType } from "./ui-store";

export interface IStore {
  simulation: SimulationModelType;
  uiStore: UIModelType;
}

export interface IStoreish {simulation: any; uiStore: any; }

export interface SerializedState {version: number; state: IStoreish; }

export const stores = {
  simulation,
  uiStore
};

// this tuple syntx allows us to declare an array of strings and a type based on
// that array at the same time.
const tuple = <T extends string[]>(...args: T) => args;

// props settable from authoring menu
const simulationAuthorSettingsProps = tuple(
  "requireEruption",
  "requirePainting",
  "scenario",
  "toolbox",
  "initialCodeTitle",
);
// additional props directly from current model that author will save
const simulationAuthorStateProps = (simulationAuthorSettingsProps as string[]).concat(tuple(
  "xmlCode",
  "initialXmlCode",
  "stagingWindSpeed",
  "stagingWindDirection",
  "stagingMass",
  "stagingColHeight",
));

const uiAuthorSettingsProps = tuple(
  "showBlocks",
  "showCode",
  "showControls",
  "showWindSpeed",
  "showWindDirection",
  "showEjectedVolume",
  "showColumnHeight",
  "showVEI",
  "showConditions",
  "showCrossSection",
  "showData",
  "showLog",
  "showDemoCharts",
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

// returns a selection of the properties of the store
function getStoreSubstate(simulationProps: string[], uiProps: string[]): () => IStoreish {
  return () => {
    const authoredSimulation = pick(simulationProps)(simulation);
    const authoredUi = pick(uiProps)(uiStore);
    return {
      simulation: authoredSimulation,
      uiStore: authoredUi
    };
  };
}

// gets the current stores state in a version appropriate for the authoring menu
export const getAuthorableSettings = getStoreSubstate(simulationAuthorSettingsProps, uiAuthorSettingsProps);
// gets the current store state to be saved by an author or student
export const getSavableState = getStoreSubstate(simulationAuthorStateProps, uiAuthorSettingsProps);

// makes state appropriate for saving to e.g. LARA. Changes keys or values as needed. Adds a version number
export const serializeState = (state: any): SerializedState => {
  const serializedState = {...state};

  // we copy simulation.xmlCode (the current blockly code) to simulation.initialXmlCode (how we want
  // to initialize blockly) when we save state
  serializedState.simulation.initialXmlCode = serializedState.simulation.xmlCode;
  delete serializedState.simulation.xmlCode;

  return {
    version: 1,
    state: serializedState
  };
};
// deserializes saved state, migrating data if necessary
export const deserializeState = (serializedState: SerializedState): IStoreish => {
  if (serializedState.version === 1) {
    return serializedState.state;
  }
  return {simulation: {}, uiStore: {}};
};

export function updateStores(state: IStoreish) {
  const simulationStoreSettings: SimulationAuthorSettings = pick(simulationAuthorStateProps)(state.simulation);
  const uiStoreSettings: UIAuthorSettings = pick(uiAuthorSettingsProps)(state.uiStore);

  simulation.loadAuthorSettingsData(simulationStoreSettings);
  uiStore.loadAuthorSettingsData(uiStoreSettings);
}
