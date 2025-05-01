import { useEffect, useMemo, useState } from "react";
import { GridCell, runSimulation } from "./molasses";
import { AsciiRaster, parseAsciiRaster } from "./parse-ascii-raster";

import "./lava.scss";
import { visualizeLava } from "./visualize-lava";

interface ISimulationDisplayProps {
  coveredCells: number;
}
function SimulationDisplay({ coveredCells }: ISimulationDisplayProps) {
  return (
    <>
      <h3>Running Simulation</h3>
      {coveredCells > 0 && (
        <>
          {/* <p>Pulse: {simulationState.pulseCount}</p> */}
          <p>Covered Cells: {coveredCells}</p>
        </>
      )}
    </>
  );
}

export function Lava() {
  const [raster, setRaster] = useState<AsciiRaster|null>(null);
  const [grid, setGrid] = useState<GridCell[][]|null>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      if (typeof content === "string") {
        const asciiRaster = parseAsciiRaster(content);
        console.log(`--- raster`, asciiRaster);
        setRaster(asciiRaster);
      }
    };
    fetch("/data/data.asc")
      .then(response => response.blob())
      .then(blob => reader.readAsText(blob));
  }, []);

  useEffect(() => {
    if (raster) {
      runSimulation(raster, setGrid);
    }
  }, [raster]);

  const coveredCells = useMemo(() => {
    if (!grid) return 0;

    let _coveredCells = 0;
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell.lavaElevation > 0) {
          _coveredCells++;
        }
      });
    });
    return _coveredCells;
  }, [grid]);

  useEffect(() => {
    if (!grid || !raster) return;

    return visualizeLava(raster, grid);
  }, [grid, raster]);

  return (
    <div className="lava-output">
      {raster
        ? <SimulationDisplay coveredCells={coveredCells} />
        : <h3>Loading Data...</h3>
      }
    </div>
  );
}
