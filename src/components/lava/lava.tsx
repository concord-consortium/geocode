import { useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { getSnapshot } from "mobx-state-tree";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import { visualizeLava } from "./visualize-lava";

import "./lava.scss";
import { autorun } from "mobx";

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
  const { coveredCells, lavaElevations, pulseCount, raster } = lavaSimulation;
  console.log(`>>> rendering lava`, pulseCount);

  useEffect(() => {
    return autorun(() => {
      if (!lavaElevations || !raster) return;

      const lavaSnapshot = getSnapshot(lavaElevations);
      return visualizeLava(raster, lavaSnapshot);
    });
  }, [lavaElevations, raster]);

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
