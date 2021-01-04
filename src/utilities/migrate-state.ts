import { UnmigratedSerializedState, SerializedState } from "../stores/stores";

export const CURRENT_SERIALIZATION_VERSION = 2;

type PartialMigration = (oldState: UnmigratedSerializedState) => UnmigratedSerializedState;
type Migration = (oldState: UnmigratedSerializedState) => SerializedState;

const migrate01to02: Migration = (oldState) => {
  if (oldState.version === 1 && !oldState.state.unit) {
    // serialization with version = 1 and a unit specified is identical to version 2
    const {simulation, uiStore} = oldState.state;
    const {toolbox, initialCodeTitle, initialXmlCode, ...tephraSimulation} = simulation;
    return {
      version: 2,
      state: {
        unit: { name: "Tephra" },
        blocklyStore: {
          toolbox,
          initialCodeTitle,
          initialXmlCode
        },
        tephraSimulation,
        seismicSimulation: {},
        uiStore: {
          ...uiStore,
          showDeformation: true,
          showRiskDiamonds: false
        }
      }
    };
  }
  return oldState as SerializedState;
};

// final migration function must be of type Migration to ensure we output SerializedState
const migrations: Array<Migration|PartialMigration> = [
  migrate01to02
];

export const migrate: Migration = (oldState: UnmigratedSerializedState) => {
  let newState = oldState;
  for (const migration of migrations) {
    newState = migration(newState);
  }
  return newState as SerializedState;
};
