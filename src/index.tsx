import { Provider } from "mobx-react";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { AppComponent } from "./components/app";
import { simulation } from "./stores/volcano-store";

ReactDOM.render(
  <Provider stores={simulation}>
    <AppComponent />
  </Provider>,
  document.getElementById("reactApp")
);
