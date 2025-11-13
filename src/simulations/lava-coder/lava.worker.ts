import { runLavaSimulation } from "./lava-simulation";

self.onmessage = (e) => {
  const { parameters } = e.data;
  if (!parameters) return;

  runLavaSimulation(parameters);
};

export default {} as typeof Worker & (new () => Worker);
