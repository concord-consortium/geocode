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

function appendValueInput(block, name, field) {
  block.appendValueInput(name)
    .setCheck("Number")
    .setAlign(Blockly.ALIGN_RIGHT)
    .appendField(field);
}

function appendEruptionVolume(block) {
  appendValueInput(block, "molasses_eruption_volume", strings.ERUPTION_VOLUME);
}
function appendLavaFront(block) {
  appendValueInput(block, "molasses_lava_front", strings.LAVA_FRONT_HEIGHT);
}
function appendVentLat(block) {
  appendValueInput(block, "molasses_vent_lat", strings.VENT_LAT);
}
function appendVentLong(block) {
  appendValueInput(block, "molasses_vent_long", strings.VENT_LONG);
}

Blockly.Blocks.molasses_simulation = {
  init() {
    basicInit(this);
    appendEruptionVolume(this);
    appendLavaFront(this);
    appendVentLat(this);
    appendVentLong(this);
  }
};

Blockly.Blocks.molasses_simulation_eruption_volume = {
  init() {
    basicInit(this);
    appendEruptionVolume(this);
  }
};

Blockly.Blocks.molasses_simulation_front = {
  init() {
    basicInit(this);
    appendLavaFront(this);
  }
};

Blockly.Blocks.molasses_simulation_lat_long = {
  init() {
    basicInit(this);
    appendVentLat(this);
    appendVentLong(this);
  }
};

function setCodeVariable(variableName, block, setFunction) {
  const value = Blockly.JavaScript.valueToCode(block, variableName, Blockly.JavaScript.ORDER_ATOMIC);
  return `
  this.${setFunction}(${value});`;
}
function setEruptionVolume(block) {
  return setCodeVariable("molasses_eruption_volume", block, "setMolassesEruptionVolume");
}
function setLavaFront(block) {
  return setCodeVariable("molasses_lava_front", block, "setMolassesLavaFront");
}
function setVentLat(block) {
  return setCodeVariable("molasses_vent_lat", block, "setMolassesVentLat");
}
function setVentLong(block) {
  return setCodeVariable("molasses_vent_long", block, "setMolassesVentLong");
}

Blockly.JavaScript.molasses_simulation = function(block) {
  let code = setEruptionVolume(block);
  code += setLavaFront(block);
  code += setVentLat(block);
  code += setVentLong(block);

  code += `
  this.runMolassesSimulation();`;
  return code;
};

Blockly.JavaScript.molasses_simulation_eruption_volume = function(block) {
  let code = setEruptionVolume(block);

  code += `
  this.runMolassesSimulation();`;
  return code;
};

Blockly.JavaScript.molasses_simulation_front = function(block) {
  let code = setLavaFront(block);

  code += `
  this.runMolassesSimulation();`;
  return code;
};

Blockly.JavaScript.molasses_simulation_lat_long = function(block) {
  let code = setVentLat(block);
  code += setVentLong(block);

  code += `
  this.runMolassesSimulation();`;
  return code;
};
