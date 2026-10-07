import { observer } from "mobx-react";
import { lavaSimulation } from "../../stores/lava-simulation-store";

import "./acres-covered-box.scss";

export const AcresCovered = observer(function AcresCovered() {
  const { lavaWorker, multirunTable, selectedRunNumber } = lavaSimulation;
  const selectedRun = selectedRunNumber != null
    ? multirunTable?.rows.find(row => row.runNumber === selectedRunNumber)
    : undefined;

  // Only display if the simulation is running or has completed, or a past run is being shown.
  if (!lavaWorker && !selectedRun) return null;

  // While a past run is displayed on the map, report that run's area rather than the live
  // value, which would contradict the selected row in the Multirun table.
  const acres = selectedRun ? selectedRun.acresCovered : lavaSimulation.acresCovered;

  return (
    <div className="acres-covered-box">
      <div className="acres-covered-label">
        {selectedRun ? `Run ${selectedRun.runNumber} - Total Area Covered:` : "Total Area Covered:"}
      </div>
      <div className="acres-covered-value">
        {Math.round(acres).toLocaleString()} acres
      </div>
    </div>
  );
});
