import { Provider } from "mobx-react";
import * as React from "react";
import * as ReactDOM from "react-dom";

import * as iframePhone from "iframe-phone";

import { AppComponent } from "./components/app";
import { onSnapshot } from "mobx-state-tree";
import { stores } from "./stores/stores";

ReactDOM.render(
  <Provider stores={stores}>
    <AppComponent />
  </Provider>,
  document.getElementById("reactApp")
);

export interface SerializedStateDataType {
  version?: number;
  blocklyXmlCode?: string;
}
type Mode = "student" | "author";

// *** LARA Data-Saving ***

/**
 * Load saved student data into the store. (Currently just the xml)
 */
const loadStateData = (state: SerializedStateDataType) => {
  if (state.blocklyXmlCode) {
    stores.simulation.setInitialXmlCode(state.blocklyXmlCode);
  }
};

const phone = iframePhone.getIFrameEndpoint();
let mode: Mode = "student";

// If we are embedded in LARA, wait for `initInteractive` and initialize model with any student data
phone.addListener("initInteractive", (data: {
    mode: any,
    authoredState: any,
    interactiveState: any,
    linkedState: any}) => {

  const authorState: SerializedStateDataType = data && data.authoredState || {};
  // student data may be in either the current interactive's saved state, or a previous model's linked state
  const studentState: SerializedStateDataType = data && (data.interactiveState || data.linkedState) || {};

  if (data.mode === "authoring") {
    mode = "author";
    stores.uiStore.setShowOptionsDialog(false);
    loadStateData(authorState);
  } else {
    // student state overwrites authored state
    const mergedState = {...authorState, ...studentState};
    loadStateData(mergedState);
  }
});

// Save data everytime stores change
const saveUserData = () => {
  if (mode === "student") {
    phone.post("interactiveState", stores.simulation.userSnapshot);
  } else {
    phone.post("authoredState", stores.simulation.userSnapshot);
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
