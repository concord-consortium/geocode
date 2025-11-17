import { VogSimulation } from "./vog-simulation";

let vogSimulation: VogSimulation;

self.onmessage = (e) => {
  const { complete, parameters, type } = e.data;

  if (type === "setup") {
    if (!parameters) return;
    vogSimulation = new VogSimulation(parameters);
  } else if (type === "run") {
    vogSimulation?.runSimulation();
  } else if (type === "step") {
    if (!vogSimulation) return;

    vogSimulation.stepSimulation();
    if (complete) {
      // When the lava eruption completes, continue dispersing vog
      vogSimulation.setStage("dispersion");
      vogSimulation.runSimulation();
    }
  }
};

export default {} as typeof Worker & (new () => Worker);
