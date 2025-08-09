import { maxLat, maxLong, minLat, minLong } from "../../components/lava-coder/lava-constants";
import * as strings from "../../strings/blockly-blocks/lava/simulate-lava";

function basicInit(block, title) {
  if (title) block.appendDummyInput().appendField(title);
  block.setPreviousStatement(true, null);
  block.setNextStatement(true, null);
  block.setColour("#EB0000");
  block.setTooltip("");
  block.setHelpUrl("");
}

function appendValueInput(block, name, field, check="Number") {
  block.appendValueInput(name)
    .setCheck(check)
    .setAlign(Blockly.ALIGN_RIGHT)
    .appendField(field);
}

function appendEruptionVolume(block, label=strings.ERUPTION_VOLUME) {
  appendValueInput(block, "molasses_eruption_volume", label);
}
function appendLavaFront(block, label=strings.LAVA_FRONT_HEIGHT) {
  appendValueInput(block, "molasses_lava_front", label);
}
function appendVentLocation(block, label=strings.VENT_LOCATION) {
  appendValueInput(block, "molasses_vent_location", label, "lat_long");
}

Blockly.Blocks.molasses_simulation_all_params = {
  init() {
    basicInit(this, strings.COMPUTE_LAVA);
    appendEruptionVolume(this);
    appendLavaFront(this);
    appendVentLocation(this);
  }
};

Blockly.Blocks.molasses_simulation_eruption_volume = {
  init() {
    basicInit(this, strings.COMPUTE_LAVA);
    appendEruptionVolume(this);
  }
};

Blockly.Blocks.molasses_simulation_lava_front = {
  init() {
    basicInit(this, strings.COMPUTE_LAVA);
    appendLavaFront(this);
  }
};

Blockly.Blocks.molasses_simulation_lat_long = {
  init() {
    basicInit(this, strings.COMPUTE_LAVA);
    appendVentLocation(this);
  }
};

Blockly.Blocks.molasses_eruption_volume = {
  init() {
    basicInit(this);
    appendEruptionVolume(this, strings.SET_ERUPTION_VOLUME);
  }
};

Blockly.Blocks.molasses_lava_front = {
  init() {
    basicInit(this);
    appendLavaFront(this, strings.SET_LAVA_FRONT_HEIGHT);
  }
};

Blockly.Blocks.molasses_vent_location = {
  init() {
    basicInit(this);
    appendVentLocation(this, strings.SET_VENT_LOCATION);
  }
};

Blockly.Blocks.molasses_run_simulation = {
  init() {
    basicInit(this, strings.RUN_SIMULATION);
    this.appendStatementInput("setters");
  }
};

// interface SetCodeVariableParameters {
//   block: Blockly.Block;
//   setFunction: string;
//   // If validation fails, call block.setWarningText with the error message
//   validateFunction?: (value: string, block: Blockly.Block) => boolean;
//   variableName: string;
// }
function setCodeVariable({ block, setFunction, validateFunction, variableName }) {
  const value = Blockly.JavaScript.valueToCode(block, variableName, Blockly.JavaScript.ORDER_ATOMIC);

  if (validateFunction && !validateFunction(value, block)) {
    return null;
  }

  return `
  this.${setFunction}(${value});`;
}

const setEruptionVolumeFunction = "setMolassesEruptionVolume";
const setLavaFrontFunction = "setMolassesLavaFront";
const setVentLocationFunction = "setMolassesVentLocation";

function setEruptionVolume(block) {
  return setCodeVariable({
    variableName: "molasses_eruption_volume",
    block,
    setFunction: setEruptionVolumeFunction
  });
}
function setLavaFront(block) {
  return setCodeVariable({
    variableName: "molasses_lava_front",
    block,
    setFunction: setLavaFrontFunction
  });
}
function setVentLocation(block) {
  return setCodeVariable({
    variableName: "molasses_vent_location",
    block,
    setFunction: setVentLocationFunction,
    validateFunction: (value, _block) => {
      // The value is a string in the form of ({lat: number, long: number})
      const regex = /^\(\{lat:\s*(-?\d+(\.\d+)?),\s*long:\s*(-?\d+(\.\d+)?)\}\)$/;
      const match = value.match(regex);

      if (!match) {
        _block.setWarningText("Latitude and longitude values must be specified");
        return false;
      }

      const lat = parseFloat(match[1]);
      const long = parseFloat(match[3]);

      if (lat == null || isNaN(lat) || long == null || isNaN(long)) {
        _block.setWarningText("Latitude and longitude values must be numbers");
        return false;
      }
      if (lat < minLat || lat > maxLat) {
        _block.setWarningText(`Latitude values must be between ${minLat} and ${maxLat}`);
        return false;
      }
      if (long < minLong || long > maxLong) {
        _block.setWarningText(`Longitude values must be between ${minLong} and ${maxLong}`);
        return false;
      }

      return true;
    }
  });
}

function runMolassesSimulation() {
  return `
  this.runMolassesSimulation();`;
}

Blockly.JavaScript.molasses_simulation_all_params = function(block) {
  const volumeCode = setEruptionVolume(block);
  const residualCode = setLavaFront(block);
  const ventCode = setVentLocation(block);

  if (volumeCode && residualCode && ventCode) {
    block.setWarningText(null);
    return volumeCode + residualCode + ventCode + runMolassesSimulation();
  }

  return "";
};

Blockly.JavaScript.molasses_simulation_eruption_volume = function(block) {
  const volumeCode = setEruptionVolume(block);

  if (volumeCode) {
    block.setWarningText(null);
    return volumeCode + runMolassesSimulation();
  }

  return "";
};

Blockly.JavaScript.molasses_simulation_lava_front = function(block) {
  const residualCode = setLavaFront(block);

  if (residualCode) {
    block.setWarningText(null);
    return residualCode + runMolassesSimulation();
  }

  return "";
};

Blockly.JavaScript.molasses_simulation_lat_long = function(block) {
  const ventCode = setVentLocation(block);

  if (ventCode) {
    block.setWarningText(null);
    return ventCode + runMolassesSimulation();
  }

  return "";
};

Blockly.JavaScript.molasses_eruption_volume = function(block) {
  const residualCode = setEruptionVolume(block);

  if (residualCode) {
    block.setWarningText(null);
    return residualCode;
  }

  return "";
};

Blockly.JavaScript.molasses_lava_front = function(block) {
  const residualCode = setLavaFront(block);

  if (residualCode) {
    block.setWarningText(null);
    return residualCode;
  }

  return "";
};

Blockly.JavaScript.molasses_vent_location = function(block) {
  const ventCode = setVentLocation(block);

  if (ventCode) {
    block.setWarningText(null);
    return ventCode;
  }

  return "";
};

Blockly.JavaScript.molasses_run_simulation = function(block) {
  const contents = Blockly.JavaScript.statementToCode(block, "setters");
  if (
    !contents.includes(setEruptionVolumeFunction) && !contents.includes(setLavaFrontFunction) &&
    !contents.includes(setVentLocationFunction)
  ) {
    block.setWarningText("You must set at least one parameter before running the simulation.");
    return "";
  } else {
    block.setWarningText(null);
  }

  return `
  this.resetSimulation();
  ${contents}
  this.runMolassesSimulation();\n`;
};
