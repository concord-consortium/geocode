import { maxEruptionVolume, maxLat, maxLong, maxResidual, minEruptionVolume, minLat, minLong, minResidual } from "../../components/lava-coder/lava-constants";
import * as strings from "../../strings/blockly-blocks/lava/simulate-lava";

function basicInit(block) {
  block.appendDummyInput()
    .appendField(strings.COMPUTE_LAVA);
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

function appendEruptionVolume(block) {
  appendValueInput(block, "molasses_eruption_volume", strings.ERUPTION_VOLUME);
}
function appendLavaFront(block) {
  appendValueInput(block, "molasses_lava_front", strings.LAVA_FRONT_HEIGHT);
}
function appendVentLocation(block) {
  appendValueInput(block, "molasses_vent_location", strings.VENT_LOCATION, "lat_long");
}

Blockly.Blocks.molasses_simulation_all_params = {
  init() {
    basicInit(this);
    appendEruptionVolume(this);
    appendLavaFront(this);
    appendVentLocation(this);
  }
};

Blockly.Blocks.molasses_simulation_eruption_volume = {
  init() {
    basicInit(this);
    appendEruptionVolume(this);
  }
};

Blockly.Blocks.molasses_simulation_lava_front = {
  init() {
    basicInit(this);
    appendLavaFront(this);
  }
};

Blockly.Blocks.molasses_simulation_lat_long = {
  init() {
    basicInit(this);
    appendVentLocation(this);
  }
};

// interface SetCodeVariableParameters {
//   block: Blockly.Block;
//   setFunction: string;
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
function setEruptionVolume(block) {
  return setCodeVariable({
    variableName: "molasses_eruption_volume",
    block,
    setFunction: "setMolassesEruptionVolume",
    validateFunction: (value, _block) => {
      const numberValue = parseFloat(value);

      if (isNaN(numberValue)) {
        _block.setWarningText("Eruption volume must be a number");
        return false;
      }
      if (numberValue < minEruptionVolume || numberValue > maxEruptionVolume) {
        _block.setWarningText(`Eruption volume must be between ${minEruptionVolume} and ${maxEruptionVolume}`);
        return false;
      }

      return true;
    }
  });
}
function setLavaFront(block) {
  return setCodeVariable({
    variableName: "molasses_lava_front",
    block,
    setFunction: "setMolassesLavaFront",
    validateFunction: (value, _block) => {
      const numberValue = parseFloat(value);

      if (isNaN(numberValue)) {
        _block.setWarningText("Lava front height must be a number");
        return false;
      }
      if (numberValue < minResidual || numberValue > maxResidual) {
        _block.setWarningText(`Lava front height must be between ${minResidual} and ${maxResidual}`);
        return false;
      }

      return true;
    }
  });
}
function setVentLocation(block) {
  return setCodeVariable({
    variableName: "molasses_vent_location",
    block,
    setFunction: "setMolassesVentLocation",
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
