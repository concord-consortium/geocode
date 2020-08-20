
import { tephraSimulation, TephraSimulationModelType } from "./tephra-simulation-store";
import { uiStore, UIModelType } from "./ui-store";
import { chartsStore, ChartsModelType } from "./charts-store";
import { samplesCollectionsStore, SamplesCollectionsModelType } from "./samples-collections-store";

export interface IStore {
  tephraSimulation: TephraSimulationModelType;
  uiStore: UIModelType;
  chartsStore: ChartsModelType;
  samplesCollectionsStore: SamplesCollectionsModelType;
}

export interface IStoreish {tephraSimulation: any; uiStore: any; }

export interface SerializedState {version: number; state: IStoreish; }

export const stores: IStore = {
  tephraSimulation,
  uiStore,
  chartsStore,
  samplesCollectionsStore,
};

// this tuple syntx allows us to declare an array of strings and a type based on
// that array at the same time.
const tuple = <T extends string[]>(...args: T) => args;

// props settable from authoring menu
const tephraSimulationAuthorSettingsProps = tuple(
  "requireEruption",
  "requirePainting",
  "scenario",
  "toolbox",
  "initialCodeTitle",
);
// additional props directly from current model that author will save
const tephraSimulationAuthorStateProps = (tephraSimulationAuthorSettingsProps as string[]).concat(tuple(
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
  "showMonteCarlo",
  "showData",
  "showSpeedControls",
  "showBarHistogram",
  "showLog",
  "showDemoCharts",
);

export type TephraSimulationAuthorSettingsProps = typeof tephraSimulationAuthorSettingsProps[number];
export type UIAuthorSettingsProps = typeof uiAuthorSettingsProps[number];

export type TephraSimulationAuthorSettings = {
  [key in TephraSimulationAuthorSettingsProps]?: any;
};
export type UIAuthorSettings = {
  [key in UIAuthorSettingsProps]?: any;
};

// picks props into a new object given an array of keys
const pick = (keys: string[]) => (o: any) => keys.reduce((a, e) => ({ ...a, [e]: o[e] }), {});

// returns a selection of the properties of the store
function getStoreSubstate(simulationProps: string[], uiProps: string[]): () => IStoreish {
  return () => {
    const authoredTephraSimulation = pick(simulationProps)(tephraSimulation);
    const authoredUi = pick(uiProps)(uiStore);
    return {
      tephraSimulation: authoredTephraSimulation,
      uiStore: authoredUi
    };
  };
}

// gets the current stores state in a version appropriate for the authoring menu
export const getAuthorableSettings = getStoreSubstate(tephraSimulationAuthorSettingsProps, uiAuthorSettingsProps);
// gets the current store state to be saved by an author or student
export const getSavableState = getStoreSubstate(tephraSimulationAuthorStateProps, uiAuthorSettingsProps);

// makes state appropriate for saving to e.g. LARA. Changes keys or values as needed. Adds a version number
export const serializeState = (state: any): SerializedState => {
  const serializedState = {...state};

  // we copy simulation.xmlCode (the current blockly code) to simulation.initialXmlCode (how we want
  // to initialize blockly) when we save state
  serializedState.tephraSimulation.initialXmlCode = serializedState.tephraSimulation.xmlCode;
  delete serializedState.tephraSimulation.xmlCode;

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
  return {tephraSimulation: {}, uiStore: {}};
};

export function updateStores(state: IStoreish) {
  const tephraSimulationStoreSettings: TephraSimulationAuthorSettings =
    pick(tephraSimulationAuthorStateProps)(state.tephraSimulation);
  const uiStoreSettings: UIAuthorSettings = pick(uiAuthorSettingsProps)(state.uiStore);

  tephraSimulation.loadAuthorSettingsData(tephraSimulationStoreSettings);
  uiStore.loadAuthorSettingsData(uiStoreSettings);
}
