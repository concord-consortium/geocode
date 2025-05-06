import { useEffect, useMemo, useState } from "react";
import RasterWorker from "./molasses.worker";
import { AsciiRaster } from "./parse-ascii-raster";
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

export function Lava() {
  const [raster, setRaster] = useState<AsciiRaster|null>(null);
  const [pulseCount, setPulseCount] = useState(0);
  const [grid, setGrid] = useState<number[][]|null>(null);

  useEffect(() => {
    const worker = new RasterWorker();
    worker.onmessage = (e) => {
      try {
        const { status } = e.data;
        if (status === "rasterParsed") {
          setRaster(e.data.raster);
        } else if (status === "runningSimulation") {
          console.log(`Running simulation...`);
        } else if (status === "updatedGrid") {
          setPulseCount(e.data.pulseCount);
          setGrid(e.data.grid);
        }
      } catch (error) {
        console.error("Error handling worker message:", error, e);
      }
    };

    worker.postMessage({ type: "start" });

    return () => {
      worker.terminate();
    };
  }, []);

  const coveredCells = useMemo(() => {
    if (!grid) return 0;

    let _coveredCells = 0;
    grid.forEach(row => {
      row.forEach(lavaElevation => {
        if (lavaElevation > 0) {
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
        ? <SimulationDisplay coveredCells={coveredCells} pulseCount={pulseCount} />
        : <h3>Loading Data...</h3>
      }
    </div>
  );
}
