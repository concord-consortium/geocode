import { Provider } from "mobx-react";
import * as React from "react";
import * as ReactDOM from "react-dom";

import * as iframePhone from "iframe-phone";

import { AppComponent } from "./components/app";
import { onSnapshot } from "mobx-state-tree";
import { stores, serializeState, getSavableState, deserializeState, updateStores,
        IStoreish, UnmigratedSerializedState } from "./stores/stores";

ReactDOM.render(
  <Provider stores={stores}>
    <AppComponent />
  </Provider>,
  document.getElementById("reactApp")
);

// *** LARA Data-Saving ***

const phone = iframePhone.getIFrameEndpoint();

type Mode = "student" | "author";
let mode: Mode = "student";
let initialState: IStoreish;
let unsaved = true;

// Save data everytime stores change (after initInteractive is called)
const saveUserData = () => {
  if (unsaved && JSON.stringify(initialState) === JSON.stringify(serializeState(getSavableState()).state)) {
    // only save state if either we've made a real change to the store, or we've saved at least once
    return;
  }

  if (mode === "student") {
    // currently the student and author save the same data. Eventually we may want some things,
    // like active tab state, to be saved only for one or the other
    phone.post("interactiveState", serializeState(getSavableState()));
  } else {
    phone.post("authoredState", serializeState(getSavableState()));
  }
  unsaved = false;
};

// mutates passed-in object by parsing any props that ought to be objects but might be strings
// (see bug https://www.pivotaltracker.com/n/projects/736901/stories/171888125)
const parseJSON = (obj: any, propsToParse: string[]) => {
  for (const prop of propsToParse) {
    if (typeof obj[prop] === "string") {
      obj[prop] = JSON.parse(obj[prop]);
    }
  }
};

// If we are embedded in LARA, wait for `initInteractive` and initialize model with any student data
phone.addListener("initInteractive", (data: {
    mode: any,
    authoredState: any,
    interactiveState: any,
    linkedState: any}) => {

  parseJSON(data, ["authoredState", "interactiveState", "linkedState"]);

  const authorState: UnmigratedSerializedState | {} = data && data.authoredState || {};
  // student data may be in either the current interactive's saved state, or a previous model's linked state
  const studentState: UnmigratedSerializedState | {} = data && (data.interactiveState || data.linkedState) || {};

  if (data.mode === "authoring") {
    mode = "author";
    initialState = deserializeState(authorState);
  } else {
    // student state overwrites authored state
    const mergedState = {...authorState, ...studentState};
    initialState = deserializeState(mergedState);
    stores.uiStore.setShowOptionsDialog(false);

    if (data.mode === "report") {
      stores.uiStore.setHideBlocklyToolbox(true);
    }
  }
  updateStores(initialState);

  onSnapshot(stores.unit, saveUserData);                   // MobX function called on every store change
  onSnapshot(stores.tephraSimulation, saveUserData);
  onSnapshot(stores.blocklyStore, saveUserData);
  onSnapshot(stores.uiStore, saveUserData);
});

// When we exit page and LARA asks for student data, tell it it's already up-to-date
phone.addListener("getInteractiveState", () => {
  phone.post("interactiveState", "nochange");
});

phone.initialize();

phone.post("supportedFeatures", {
  apiVersion: 1,
  features: {
    authoredState: true,
    interactiveState: true,
    aspectRatio: 960 / 620
  }
});
