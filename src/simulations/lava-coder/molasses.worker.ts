import { runSimulation } from "./molasses";

self.onmessage = (e) => {
  if (!e.data.parameters) return;

  runSimulation({ ...e.data.parameters, postMessage });
};

export default {} as typeof Worker & (new () => Worker);
