import { useEffect } from "react";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import RasterWorker from "./raster.worker";

export function useElevationData() {
  // Load the elevation data
  useEffect(() => {
    if (lavaSimulation.raster) return;

    const rasterWorker = new RasterWorker();
    rasterWorker.onmessage = (e) => {
      try {
        const { status } = e.data;
        if (status === "rasterParsed") {
          lavaSimulation.setRaster(e.data.raster);
          rasterWorker.terminate();
        }
      } catch (error) {
        console.error("Error handling worker message:", error, e);
      }
    };

    rasterWorker.postMessage({ type: "start" });

    return () => {
      rasterWorker.terminate();
    };
  }, []);
}
