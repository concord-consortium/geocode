Blockly.Blocks['fill_cell'] = {
  init: function() {
    this.appendValueInput("hue")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("hue");
    this.appendValueInput("sat")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("saturation");
    this.appendValueInput("value")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("value");
    this.appendValueInput("alpha")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("alpha");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['fill_cell'] = function(block) {
  var hue = Blockly.JavaScript.valueToCode(block, 'hue', Blockly.JavaScript.ORDER_ATOMIC);
  var sat = Blockly.JavaScript.valueToCode(block, 'sat', Blockly.JavaScript.ORDER_ATOMIC);
  var value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
  var alpha = Blockly.JavaScript.valueToCode(block, 'alpha', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `
    this.fill && this.fill( ${hue || 1}, ${sat || 50}, ${value || 50}, ${alpha || 10 });
  `;
  return code;
};

/************************************************* */

Blockly.Blocks['run_sumilation'] = {
  init: function() {
    this.appendValueInput("mass")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Mass (kg)");
    this.appendValueInput("coumn_height")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Column Height (km)");
    this.appendValueInput("wind_speed")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Wind Speed (m/s)");
    this.appendValueInput("particle_size")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Particle Size");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Simulation parameters");
    this.setHelpUrl("");
  }
}

Blockly.JavaScript['run_sumilation'] = function(block) {
  var value_mass = Blockly.JavaScript.valueToCode(block, 'mass', Blockly.JavaScript.ORDER_ATOMIC);
  var value_coumn_height = Blockly.JavaScript.valueToCode(block, 'coumn_height', Blockly.JavaScript.ORDER_ATOMIC);
  var value_wind_speed = Blockly.JavaScript.valueToCode(block, 'wind_speed', Blockly.JavaScript.ORDER_ATOMIC);
  var value_particle_size = Blockly.JavaScript.valueToCode(block, 'particle_size', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  var code = `
    var mass=${value_mass};
    var modelParams = {
      mass: ${value_mass || 100},
      colHeight: ${value_coumn_height || 10},
      windSpeed: ${value_wind_speed || 0},
      particleSize: ${value_particle_size || 1}
    }
    // this.setModelParams(modelParams);
    this.setModelParams(modelParams);
  `;
  return code;
};

/************************************************* */
Blockly.Blocks['thickness'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("tephra thickness");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};


Blockly.JavaScript['thickness'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = `(this.thickness)`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.Blocks['x'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("X");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['x'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = `(this.x)`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['y'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Y");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['y'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = `(this.y)`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.Blocks['console_logger'] = {
  init: function() {
    this.appendValueInput("logString")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("thingtoLog");
    this.setColour(165);
 this.setTooltip("Log something to the console");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['console_logger'] = function(block) {
  const value_logstring = Blockly.JavaScript.valueToCode(block, 'logString', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  const code = `console.log(${value_logstring});`;
  return code;
};




Blockly.JavaScript['console_log_from_blockly'] = function(block) {
  const code = `
    console.log('from blockly');\n
    console.log(this.count);\n
    console.log(this.rocks);\n
  `;
  return code;
};

Blockly.Blocks['clear'] = {
  init: function() {
    this.appendValueInput("logString")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("clear");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(165);
 this.setTooltip("clear the screen");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['clear'] = function(block) {
  const code ='clearCanvas();\n';
  return code;
};

