
import { tephraSimulation, TephraSimulationModelType } from "./tephra-simulation-store";
import { uiStore, UIModelType } from "./ui-store";
import { chartsStore, ChartsModelType } from "./charts-store";
import { samplesCollectionsStore, SamplesCollectionsModelType } from "./samples-collections-store";
import { BlocklyStoreModelType, blocklyStore } from "./blockly-store";

export interface IStore {
  blocklyStore: BlocklyStoreModelType;
  tephraSimulation: TephraSimulationModelType;
  uiStore: UIModelType;
  chartsStore: ChartsModelType;
  samplesCollectionsStore: SamplesCollectionsModelType;
}

export interface IStoreish {blocklyStore: any; tephraSimulation: any; uiStore: any; }

export interface SerializedState {version: number; state: IStoreish; }

export const stores: IStore = {
  blocklyStore,
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
);
// additional props directly from current model that author will save
const tephraSimulationAuthorStateProps = (tephraSimulationAuthorSettingsProps as string[]).concat(tuple(
  "stagingWindSpeed",
  "stagingWindDirection",
  "stagingMass",
  "stagingColHeight",
));

export type TephraSimulationAuthorSettingsProps = typeof tephraSimulationAuthorSettingsProps[number];

export type TephraSimulationAuthorSettings = {
  [key in TephraSimulationAuthorSettingsProps]?: any;
};

// props settable from authoring menu
const blocklyAuthorSettingsProps = tuple(
  "toolbox",
  "initialCodeTitle",
);
// additional props directly from current model that author will save
const blocklyAuthorStateProps = (blocklyAuthorSettingsProps as string[]).concat(tuple(
  "xmlCode",
  "initialXmlCode",
));

export type BlocklyStoreAuthorSettingsProps = typeof blocklyAuthorSettingsProps[number];

export type BlocklyStoreAuthorSettings = {
  [key in BlocklyStoreAuthorSettingsProps]?: any;
};

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

export type UIAuthorSettingsProps = typeof uiAuthorSettingsProps[number];

export type UIAuthorSettings = {
  [key in UIAuthorSettingsProps]?: any;
};

// picks props into a new object given an array of keys
const pick = (keys: string[]) => (o: any) => keys.reduce((a, e) => ({ ...a, [e]: o[e] }), {});

// returns a selection of the properties of the store
function getStoreSubstate(blocklyStoreProps: string[], tephraSimulationProps: string[], uiProps: string[]) {
  return (): IStoreish => {
    return {
      blocklyStore: pick(blocklyStoreProps)(blocklyStore),
      tephraSimulation: pick(tephraSimulationProps)(tephraSimulation),
      uiStore: pick(uiProps)(uiStore)
    };
  };
}

// gets the current stores state in a version appropriate for the authoring menu
export const getAuthorableSettings =
  getStoreSubstate(blocklyAuthorSettingsProps, tephraSimulationAuthorSettingsProps, uiAuthorSettingsProps);
// gets the current store state to be saved by an author or student
export const getSavableState =
  getStoreSubstate(blocklyAuthorStateProps, tephraSimulationAuthorStateProps, uiAuthorSettingsProps);

// makes state appropriate for saving to e.g. LARA. Changes keys or values as needed. Adds a version number
export const serializeState = (state: IStoreish): SerializedState => {
  const serializedState = {...state};

  // we copy simulation.xmlCode (the current blockly code) to simulation.initialXmlCode (how we want
  // to initialize blockly) when we save state
  serializedState.blocklyStore.initialXmlCode = serializedState.blocklyStore.xmlCode;
  delete serializedState.blocklyStore.xmlCode;

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
  return {blocklyStore: {}, tephraSimulation: {}, uiStore: {}};
};

export function updateStores(state: IStoreish) {
  const blocklyStoreSettings: BlocklyStoreAuthorSettings =
    pick(blocklyAuthorStateProps)(state.blocklyStore);
  const tephraSimulationStoreSettings: TephraSimulationAuthorSettings =
    pick(tephraSimulationAuthorStateProps)(state.tephraSimulation);
  const uiStoreSettings: UIAuthorSettings = pick(uiAuthorSettingsProps)(state.uiStore);

  blocklyStore.loadAuthorSettingsData(blocklyStoreSettings);
  tephraSimulation.loadAuthorSettingsData(tephraSimulationStoreSettings);
  uiStore.loadAuthorSettingsData(uiStoreSettings);
}
