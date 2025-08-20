
import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import { flagColors, maxLat, maxLong, minLat, minLong } from "../../components/lava-coder/lava-constants";
import { dataHue } from "../../constants";
import { uiStore } from "../../stores/ui-store";
import * as strings from "../../strings/blockly-blocks/lava/simulate-lava";

function basicInit(block, title, color="#EB0000") {
  if (title) block.appendDummyInput().appendField(title);
  block.setPreviousStatement(true, null);
  block.setNextStatement(true, null);
  block.setColour(color);
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

Blockly.Blocks.molasses_set_flag_location = {
  init() {
    basicInit(this, strings.SET_FLAG_LOCATION);
    this.appendDummyInput()
      .appendField("named")
      .appendField(new Blockly.FieldTextInput(""), "name");
    this.appendDummyInput()
      .appendField("color")
      .appendField(new Blockly.FieldDropdown(flagColors.map(color => [color, color])), "color");
    appendValueInput(this, "location", "location", "lat_long");
  }
};

Blockly.Blocks.molasses_create_table = {
  init() {
    basicInit(this, strings.CREATE_TABLE, dataHue);
  }
};

// interface for getAndValidateValue and setCodeVariable parameters:
// {
//   block: Blockly.Block;
//   setFunction: string;
//   // If validation fails, call block.setWarningText with the error message
//   validateFunction?: (value: string, block: Blockly.Block) => boolean;
//   variableName: string;
// }
function getAndValidateValue({ block, validateFunction, variableName }) {
  const value = javascriptGenerator.valueToCode(block, variableName, javascriptGenerator.ORDER_ATOMIC);

  validateFunction?.(value, block);

  return value;
}

function setCodeVariable({ block, setFunction, validateFunction, variableName }) {
  const value = getAndValidateValue({ block, validateFunction, variableName });

  if (value == null) return null;

  return `
  this.${setFunction}(${value});`;
}

const setEruptionVolumeFunction = "setMolassesEruptionVolume";
const setLavaFrontFunction = "setMolassesLavaFront";
const setVentLocationFunction = "setMolassesVentLocation";

function getNumberValidationFunction(fieldName, min, max) {
  return (value, block) => {
    if (value == null || value === "") {
      block.setWarningText(`${fieldName} must be specified`);
      return false;
    }

    const numberValue = parseFloat(value);
    // If numberValue is NaN, it might be a variable containing a number, so we don't know if it's invalid.
    if (!isNaN(numberValue) && (numberValue < min || numberValue > max)) {
      block.setWarningText(`${fieldName} must be between ${min} and ${max}`);
      return false;
    }

    block.setWarningText(null);
    return true;
  };
}

javascriptGenerator.forBlock.molasses_eruption_volume = function(block) {
  return setCodeVariable({
    variableName: "molasses_eruption_volume",
    block,
    setFunction: setEruptionVolumeFunction,
    validateFunction:
      getNumberValidationFunction("Eruption volume", uiStore.minEruptionVolume, uiStore.maxEruptionVolume)
  });
};

javascriptGenerator.forBlock.molasses_lava_front = function(block) {
  return setCodeVariable({
    variableName: "molasses_lava_front",
    block,
    setFunction: setLavaFrontFunction,
    validateFunction:
      getNumberValidationFunction("Lava front height", uiStore.minLavaFrontHeight, uiStore.maxLavaFrontHeight)
  });
};

function validateLatLong(value, block) {
  // The value is a string in the form of ({lat: number, long: number})
  const regex = /^\(\{lat:\s*(-?\d+(\.\d+)?),\s*long:\s*(-?\d+(\.\d+)?)\}\)$/;
  const match = value.match(regex);

  if (!match) {
    block.setWarningText("Latitude and longitude values must be specified");
    return false;
  }

  const lat = parseFloat(match[1]);
  const long = parseFloat(match[3]);

  if (lat == null || isNaN(lat) || long == null || isNaN(long)) {
    block.setWarningText("Latitude and longitude values must be numbers");
    return false;
  }
  if (lat < minLat || lat > maxLat) {
    block.setWarningText(`Latitude values must be between ${minLat} and ${maxLat}`);
    return false;
  }
  if (long < minLong || long > maxLong) {
    block.setWarningText(`Longitude values must be between ${minLong} and ${maxLong}`);
    return false;
  }

  block.setWarningText(null);
  return true;
}

javascriptGenerator.forBlock.molasses_vent_location = function(block) {
  return setCodeVariable({
    variableName: "molasses_vent_location",
    block,
    setFunction: setVentLocationFunction,
    validateFunction: validateLatLong
  });
};

javascriptGenerator.forBlock.molasses_run_simulation = function(block) {
  const contents = javascriptGenerator.statementToCode(block, "setters");
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

javascriptGenerator.forBlock.molasses_set_flag_location = function(block) {
  const flagName = block.getFieldValue("name") ?? "";
  if (flagName && flagName.length > 15) {
    block.setWarningText("Flag name cannot be more than 15 characters.");
    return "";
  }
  const flagColor = block.getFieldValue("color") || flagColors[0];
  const position = getAndValidateValue({
    variableName: "location",
    block,
    validateFunction: validateLatLong
  });
  if (!position) return "";
  block.setWarningText(null);

  return `
  this.addFlagLocation({ location: ${position}, color: "${flagColor}", name: "${flagName}" });\n`;
};

javascriptGenerator.forBlock.molasses_create_table = function(block) {
  return `
  this.createTable();
  `;
};
