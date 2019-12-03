

/************************ Weather Picker ************************/
Blockly.Blocks['data_sampler'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Load wind data from")
        .appendField(new Blockly.FieldDropdown([["Winter","winter"], ["Spring","spring"], ["Summer","summer"], ["Fall","fall"]]), "season");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['data_sampler'] = function(block) {
  var dropdown_season = block.getFieldValue('season');
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};


/************************ Select Random Day ************************/
Blockly.Blocks['random_sample'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Sample weather from random day")
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['random_sample'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};


/************************* Sample Speed **********************/
Blockly.Blocks['sample_speed'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("wind speed from sample");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['sample_speed'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};



/************************* Sample Direction **********************/
Blockly.Blocks['sample_direction'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("wind direction from sample");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['sample_direction'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};



/************************* Sample Wind **********************/
Blockly.Blocks['sample_wind'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("set wind from sample");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['sample_wind'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};