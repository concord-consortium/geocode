import { flagColors, maxLat, maxLong, minLat, minLong } from "../../components/lava-coder/lava-constants";
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

Blockly.Blocks.molasses_set_flag_location = {
  init() {
    basicInit(this, strings.SET_FLAG_LOCATION);
    this.appendDummyInput()
      .appendField("named")
      .appendField(new Blockly.FieldTextInput(""), "flag_label");
    this.appendDummyInput()
      .appendField("color")
      .appendField(new Blockly.FieldDropdown(flagColors.map(color => [color, color])), "flag_color");
    appendValueInput(this, "molasses_flag_location", "location", "lat_long");
  }
};

function getAndValidateValue({ block, validateFunction, variableName }) {
  const value = Blockly.JavaScript.valueToCode(block, variableName, Blockly.JavaScript.ORDER_ATOMIC);

  if (validateFunction && !validateFunction(value, block)) {
    return null;
  }

  return value;
}

// interface SetCodeVariableParameters {
//   block: Blockly.Block;
//   setFunction: string;
//   // If validation fails, call block.setWarningText with the error message
//   validateFunction?: (value: string, block: Blockly.Block) => boolean;
//   variableName: string;
// }
function setCodeVariable({ block, setFunction, validateFunction, variableName }) {
  const value = getAndValidateValue({ block, validateFunction, variableName });

  if (value == null) return null;

  return `
  this.${setFunction}(${value});`;
}

const setEruptionVolumeFunction = "setMolassesEruptionVolume";
const setLavaFrontFunction = "setMolassesLavaFront";
const setVentLocationFunction = "setMolassesVentLocation";

Blockly.JavaScript.molasses_eruption_volume = function(block) {
  const setEruptionVolumeCode = setCodeVariable({
    variableName: "molasses_eruption_volume",
    block,
    setFunction: setEruptionVolumeFunction
  });

  if (setEruptionVolumeCode) {
    block.setWarningText(null);
    return setEruptionVolumeCode;
  }

  return "";
};

Blockly.JavaScript.molasses_lava_front = function(block) {
  const setLavaFrontCode = setCodeVariable({
    variableName: "molasses_lava_front",
    block,
    setFunction: setLavaFrontFunction
  });

  if (setLavaFrontCode) {
    block.setWarningText(null);
    return setLavaFrontCode;
  }

  return "";
};

function validateLatLong(value, _block) {
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

Blockly.JavaScript.molasses_vent_location = function(block) {
  const setVentLocationCode = setCodeVariable({
    variableName: "molasses_vent_location",
    block,
    setFunction: setVentLocationFunction,
    validateFunction: validateLatLong
  });

  if (setVentLocationCode) {
    block.setWarningText(null);
    return setVentLocationCode;
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

Blockly.JavaScript.molasses_set_flag_location = function(block) {
  const flagLabel = block.getFieldValue('flag_label');
  if (flagLabel && flagLabel.length > 15) {
    block.setWarningText("Flag name cannot be more than 15 characters.");
    return "";
  }
  const flagColor = block.getFieldValue('flag_color') || "green";
  const position = getAndValidateValue({
    variableName: "molasses_flag_location",
    block,
    validateFunction: validateLatLong
  });
  if (!position) return "";
  block.setWarningText(null);

  console.log(`--- flag`, flagLabel, flagColor, position);

  return "";
  // return `
  // this.setMolassesFlagLocation(${flagLabel});\n`;
};
