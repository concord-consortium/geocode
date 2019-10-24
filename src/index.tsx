import { Provider } from "mobx-react";
import * as React from "react";
import * as ReactDOM from "react-dom";

import * as iframePhone from "iframe-phone";

import { AppComponent } from "./components/app";
import { simulation } from "./stores/simulation-store";
import { onSnapshot } from "mobx-state-tree";

ReactDOM.render(
  <Provider stores={simulation}>
    <AppComponent />
  </Provider>,
  document.getElementById("reactApp")
);

export interface UserSaveDataType {
  version?: number;
  blocklyXmlCode?: string;
}

// *** LARA Data-Saving ***

/**
 * Load saved student data into the store. (Currently just the xml)
 */
const loadStudentData = (studentData: UserSaveDataType) => {
  if (studentData.blocklyXmlCode) {
    simulation.setInitialXmlCode(studentData.blocklyXmlCode);
  }
};

const phone = iframePhone.getIFrameEndpoint();

// If we are embedded in LARA, wait for `initInteractive` and initialize model with any student data
phone.addListener("initInteractive", (data: {
    mode: any,
    authoredState: any,
    interactiveState: any,
    linkedState: any}) => {
  // student data may be in either the current interactive's saved state, or a previous model's linked state
  const studentData: UserSaveDataType = data && (data.interactiveState || data.linkedState) || {};
  loadStudentData(studentData);
});

// Save data everytime stores change
const saveUserData = () => {
  phone.post("interactiveState", simulation.userSnapshot);
};
onSnapshot(simulation, saveUserData);       // MobX function called on every store change

// When we exit page and LARA asks for student data, tell it it's already up-to-date
phone.addListener("getInteractiveState", () => {
  phone.post("interactiveState", "nochange");
});

phone.initialize();

phone.post("supportedFeatures", {
  apiVersion: 1,
  features: {
    interactiveState: true
  }
});
