import { useEffect, useState } from "react";
import { runSimulation, SimulationState } from "./molasses";
import { AsciiRaster, parseAsciiRaster } from "./parse-ascii-raster";

import "./lava.scss";

interface ISimulationDisplayProps {
  simulationState: SimulationState | null;
}
function SimulationDisplay({ simulationState }: ISimulationDisplayProps) {
  return (
    <>
      <h3>Running Simulation</h3>
      {simulationState && (
        <>
          <p>Pulse: {simulationState.pulseCount}</p>
          <p>Covered Cells: {simulationState.coveredCells}</p>
        </>
      )}
    </>
  );
}

export function Lava() {
  const [raster, setRaster] = useState<AsciiRaster|null>(null);
  const [simulationState, setSimulationState] = useState<SimulationState|null>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      if (typeof content === "string") {
        const asciiRaster = parseAsciiRaster(content);
        console.log(`--- raster`, asciiRaster);
        setRaster(asciiRaster);
        runSimulation(asciiRaster, setSimulationState);
      }
    };
    fetch("/data/data.asc")
      .then(response => response.blob())
      .then(blob => reader.readAsText(blob));
  }, []);

  return (
    <div className="lava-output">
      {raster
        ? <SimulationDisplay simulationState={simulationState} />
        : <h3>Loading Data...</h3>
      }
    </div>
  );
}
