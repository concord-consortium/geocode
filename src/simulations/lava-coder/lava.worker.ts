import { LavaSimulation } from "./lava-simulation";

const millisecondsPerFrame = 200;

let lavaSimulation: LavaSimulation;
let paused = false;

self.onmessage = (e) => {
  const { parameters, type } = e.data;

  if (type === "run") {
    if (!parameters) return;

    lavaSimulation = new LavaSimulation(parameters);
    runLavaSimulation();
  } else if (type === "pause") {
    paused = true;
  } else if (type === "unpause") {
    paused = false;
  }
};

async function runLavaSimulation() {
  const startTime = Date.now();

  let lastFrameTime = Date.now();
  while (lavaSimulation.currentTotalVolume > 0) {
    // Wait while the simulation is paused
    while (paused) {
      await new Promise<void>((r) => setTimeout(r, 30));
    }

    lavaSimulation.stepSimulation();
    lavaSimulation.pulseCount++;

    lavaSimulation.sendStepMessage(lavaSimulation.currentTotalVolume <= 0);
    if (Date.now() - lastFrameTime >= millisecondsPerFrame) {
      lavaSimulation.sendUpdateMessage();
      lastFrameTime = Date.now();
    }

    // Check for messages (like pause)
    await new Promise<void>((r) => setTimeout(r, 1));
  }

  // Send a final update
  lavaSimulation.sendUpdateMessage(true);

  const endTime = Date.now();
  // eslint-disable-next-line no-console
  console.log(`  - Simulation completed in ${endTime - startTime} ms`);
}

export default {} as typeof Worker & (new () => Worker);
