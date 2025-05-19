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
function setVentLocation(block) {
  return setCodeVariable("molasses_vent_location", block, "setMolassesVentLocation");
}

function runMolassesSimulation() {
  return `
  this.runMolassesSimulation();`;
}

Blockly.JavaScript.molasses_simulation_all_params = function(block) {
  let code = setEruptionVolume(block);
  code += setLavaFront(block);
  code += setVentLocation(block);

  code += runMolassesSimulation();
  return code;
};

Blockly.JavaScript.molasses_simulation_eruption_volume = function(block) {
  let code = setEruptionVolume(block);

  code += runMolassesSimulation();
  return code;
};

Blockly.JavaScript.molasses_simulation_lava_front = function(block) {
  let code = setLavaFront(block);

  code += runMolassesSimulation();
  return code;
};

Blockly.JavaScript.molasses_simulation_lat_long = function(block) {
  let code = setVentLocation(block);

  code += runMolassesSimulation();
  return code;
};
