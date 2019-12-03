

/************************ Create Scenario ************************/
Blockly.Blocks['create_scenario'] = {
  init: function() {
    this.appendValueInput("VEI")
        .setCheck("Number")
        .appendField("VEI");
    this.appendValueInput("Direction")
        .setCheck("Number")
        .appendField("Wind Direction");
    this.appendValueInput("Speed")
        .setCheck("Number")
        .appendField("Wind Speed");
    this.setInputsInline(true);
    this.setOutput(true, "Scenario");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['create_scenario'] = function(block) {
  var dropdown_season = block.getFieldValue('season');
  // TODO: Assemble JavaScript into code variable.
  var code = '\n';
  return code;
};


/******************************************************************/
Blockly.Blocks['add_scenario_to_list'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Add");
    this.appendValueInput("VEI")
        .setCheck("Number")
        .appendField("scenario");
    this.appendDummyInput()
        .appendField("to scenario list");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['add_scenario_to_list'] = function(block) {
  var value_vei = Blockly.JavaScript.valueToCode(block, 'VEI', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '\n';
  return code;
};