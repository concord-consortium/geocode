
import { tephraSimulation, TephraSimulationModelType } from "./tephra-simulation-store";
import { seismicSimulation, SeismicSimulationModelType } from "./seismic-simulation-store";
import { uiStore, UIModelType } from "./ui-store";
import { chartsStore, ChartsModelType } from "./charts-store";
import { samplesCollectionsStore, SamplesCollectionsModelType } from "./samples-collections-store";
import { BlocklyStoreModelType, blocklyStore } from "./blockly-store";
import { UnitStoreType, unitStore } from "./unit-store";

export interface IStore {
  unit: UnitStoreType;
  blocklyStore: BlocklyStoreModelType;
  tephraSimulation: TephraSimulationModelType;
  seismicSimulation: SeismicSimulationModelType;
  uiStore: UIModelType;
  chartsStore: ChartsModelType;
  samplesCollectionsStore: SamplesCollectionsModelType;
}

export interface IStoreish {
  unit: {name: "Tephra" | "Seismic" };
  blocklyStore: any;
  tephraSimulation: any;
  seismicSimulation: any;
  deformationSimulation: any;
  uiStore: any;
}

export interface SerializedState {version: number; state: IStoreish; }

export const stores: IStore = {
  unit: unitStore,
  blocklyStore,
  tephraSimulation,
  seismicSimulation,
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
  "showDeformation",
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
      unit: { name: stores.unit.name },
      blocklyStore: pick(blocklyStoreProps)(blocklyStore),
      tephraSimulation: pick(tephraSimulationProps)(tephraSimulation),
      seismicSimulation: {},      // nothing to save yet
      deformationSimulation: {},
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
  return {
    unit: { name: "Tephra" },
    blocklyStore: {}, tephraSimulation: {}, seismicSimulation: {}, deformationSimulation: {}, uiStore: {}
  };
};

export function updateStores(state: IStoreish) {
  const blocklyStoreSettings: BlocklyStoreAuthorSettings =
    pick(blocklyAuthorStateProps)(state.blocklyStore);
  const tephraSimulationStoreSettings: TephraSimulationAuthorSettings =
    pick(tephraSimulationAuthorStateProps)(state.tephraSimulation);
  const uiStoreSettings: UIAuthorSettings = pick(uiAuthorSettingsProps)(state.uiStore);

  unitStore.setUnit(state.unit.name);
  blocklyStore.loadAuthorSettingsData(blocklyStoreSettings);
  tephraSimulation.loadAuthorSettingsData(tephraSimulationStoreSettings);
  uiStore.loadAuthorSettingsData(uiStoreSettings);
}
