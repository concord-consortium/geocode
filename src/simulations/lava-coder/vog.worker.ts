import { VogSimulation } from "./vog-simulation";

let vogSimulation: VogSimulation;
let paused = false;

self.onmessage = (e) => {
  const { complete, parameters, type } = e.data;

  if (type === "setup") {
    if (!parameters) return;
    vogSimulation = new VogSimulation(parameters);
  } else if (type === "run") {
    runVogSimulation();
  } else if (type === "pause") {
    paused = true;
  } else if (type === "unpause") {
    paused = false;
  } else if (type === "step") {
    if (!vogSimulation) return;

    vogSimulation.stepSimulation();
    if (complete) {
      // When the lava eruption completes, continue dispersing vog
      vogSimulation.setPhase("dispersion");
      runVogSimulation();
    }
  }
};

const msPerStep = 25;
async function runVogSimulation() {
  let pulseCount = 0;

  while (pulseCount < vogSimulation.vogPulses) {
    // Wait while the simulation is paused
    while (paused) {
      await new Promise<void>((r) => setTimeout(r, 30));
    }

    const stepEndTime = Date.now() + msPerStep;

    vogSimulation.stepSimulation();
    pulseCount++;

    // Switch to dispersion mode once we're finished creating particles
    if (pulseCount >= vogSimulation.vogPulses && vogSimulation.phase === "creation") {
      vogSimulation.setPhase("dispersion");
      pulseCount = 0;
    }

    // Delay to make sure the wind dispersion animates at a reasonable speed
    while (Date.now() < stepEndTime) {
      await new Promise<void>((r) => setTimeout(r, 30));
    }
  }

  vogSimulation.sendUpdateMessage(true);
}

export default {} as typeof Worker & (new () => Worker);
