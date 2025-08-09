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

Blockly.Blocks.molasses_eruption_volume = {
  init() {
    basicInit(this);
    appendValueInput(this, "molasses_eruption_volume", strings.SET_ERUPTION_VOLUME);
  }
};

Blockly.Blocks.molasses_lava_front = {
  init() {
    basicInit(this);
    appendValueInput(this, "molasses_lava_front", strings.SET_LAVA_FRONT_HEIGHT);
  }
};

Blockly.Blocks.molasses_vent_location = {
  init() {
    basicInit(this);
    appendValueInput(this, "molasses_vent_location", strings.SET_VENT_LOCATION, "lat_long");
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

Blockly.JavaScript.molasses_eruption_volume = function(block) {
  const residualCode = setCodeVariable({
    variableName: "molasses_eruption_volume",
    block,
    setFunction: setEruptionVolumeFunction
  });

  if (residualCode) {
    block.setWarningText(null);
    return residualCode;
  }

  return "";
};

Blockly.JavaScript.molasses_lava_front = function(block) {
  const residualCode = setCodeVariable({
    variableName: "molasses_lava_front",
    block,
    setFunction: setLavaFrontFunction
  });

  if (residualCode) {
    block.setWarningText(null);
    return residualCode;
  }

  return "";
};

Blockly.JavaScript.molasses_vent_location = function(block) {
  const ventCode = setCodeVariable({
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
