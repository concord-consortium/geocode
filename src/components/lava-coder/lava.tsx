import { useEffect } from "react";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import { lavaElevations, lavaSimulation } from "../../stores/lava-simulation-store";
import { visualizeLava } from "./visualize-lava";

import "./lava.scss";

interface ISimulationDisplayProps {
  coveredCells: number;
  pulseCount: number;
}
function SimulationDisplay({ coveredCells, pulseCount }: ISimulationDisplayProps) {
  return (
    <>
      <h3>Running Simulation</h3>
      {coveredCells > 0 && (
        <>
          <p>Pulse: {pulseCount}</p>
          <p>Covered Cells: {coveredCells}</p>
        </>
      )}
    </>
  );
}

interface ILavaProps {
  height: number;
  width: number;
}
export const Lava = observer(function Lava({ height, width }: ILavaProps) {
  const { coveredCells, pulseCount, raster } = lavaSimulation;

  useEffect(() => {
    return autorun(() => {
      if (!coveredCells || !lavaElevations || !raster) return;

      return visualizeLava(raster, lavaElevations);
    });
  }, [coveredCells, raster]);

  return (
    <div className="lava-output" style={{ height, width }}>
      {raster
        ? <SimulationDisplay coveredCells={coveredCells} pulseCount={pulseCount} />
        : <h3>Loading Data...</h3>
      }
      <div id="lava-map" />
    </div>
  );
});
