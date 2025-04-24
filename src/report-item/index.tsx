import React from "react";
import { createRoot } from "react-dom/client";
import { AppComponent } from "./app";

import "../css/report-item.css";

const container = document.getElementById("reportItemApp");
if (container) {
  const root = createRoot(container);
  root.render(<AppComponent />);
}
