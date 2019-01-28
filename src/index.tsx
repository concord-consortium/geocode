
// import "./index.sass";
import Volcano from "./volcano";
import { Provider } from "mobx-react";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { AppComponent } from "./components/app";
import { createStores } from "./models/volcano-store";

const stores = createStores({ });

ReactDOM.render(
  <Provider stores={stores}>
    <AppComponent />
  </Provider>,
  document.getElementById("reactApp")
);
