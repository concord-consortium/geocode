import { observer } from "mobx-react-lite";
import { lavaSimulation } from "../../stores/lava-simulation-store";

import "./acres-covered-box.scss";

export const AcresCovered = observer(function AcresCovered() {
  // Only display if the simulation is running or has completed.
  if (!lavaSimulation.worker) return null;

  return (
    <div className="acres-covered-box">
      <div className="acres-covered-label">Total Area Covered:</div>
      <div className="acres-covered-value">
        {Math.round(lavaSimulation.acresCovered).toLocaleString()} acres
      </div>
    </div>
  );
});
