import { runSimulation } from "./molasses";

self.onmessage = (e) => {
  if (!e.data.raster) return;

  runSimulation(e.data.raster, postMessage);
};

export default {} as typeof Worker & (new () => Worker);
