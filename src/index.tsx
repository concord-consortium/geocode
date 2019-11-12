import { Provider } from "mobx-react";
import * as React from "react";
import * as ReactDOM from "react-dom";

import * as iframePhone from "iframe-phone";

import { AppComponent } from "./components/app";
import { onSnapshot } from "mobx-state-tree";
import { stores, serializeState, getSavableState, deserializeState, updateStores, SerializedState } from "./stores/stores";

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

// If we are embedded in LARA, wait for `initInteractive` and initialize model with any student data
phone.addListener("initInteractive", (data: {
    mode: any,
    authoredState: any,
    interactiveState: any,
    linkedState: any}) => {

  const authorState: SerializedState = data && data.authoredState || {};
  // student data may be in either the current interactive's saved state, or a previous model's linked state
  const studentState: SerializedState = data && (data.interactiveState || data.linkedState) || {};

  if (data.mode === "authoring") {
    mode = "author";
    updateStores(deserializeState(authorState));
  } else {
    // student state overwrites authored state
    const mergedState = {...authorState, ...studentState};
    updateStores(deserializeState(mergedState));
    stores.uiStore.setShowOptionsDialog(false);
  }
});

// Save data everytime stores change
const saveUserData = () => {
  if (mode === "student") {
    // currently the student and author save the same data. Eventually we may want some things,
    // like active tab state, to be saved only for one or the other
    phone.post("interactiveState", serializeState(getSavableState()));
  } else {
    phone.post("authoredState", serializeState(getSavableState()));
  }
};
onSnapshot(stores.simulation, saveUserData);       // MobX function called on every store change
onSnapshot(stores.uiStore, saveUserData);

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
