Blockly.Blocks['create_sample_location'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Create a location")
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("at x")
        .appendField(new Blockly.FieldNumber(0), "x")
        .appendField("km");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("y")
        .appendField(new Blockly.FieldNumber(0), "y")
        .appendField("km");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("named")
        .appendField(new Blockly.FieldTextInput("Location"), "name");
    this.appendDummyInput()
        .appendField("and mark it on the map")
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#108A00");
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['create_sample_location'] = function (block) {
  var value_name = block.getFieldValue('name');
  var value_x = block.getFieldValue('x');
  var value_y = block.getFieldValue('y');

  var code = `createSampleLocation({name: "${value_name}", x: ${value_x}, y: ${value_y}});\n`;

  return code;
}

Blockly.Blocks['create_sample_collection'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Create a data collection")
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("named")
        .appendField(new Blockly.FieldTextInput("Name"), "name");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("set threshold to")
        .appendField(new Blockly.FieldNumber(200), "threshold")
        .appendField("mm");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#108A00");
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['create_sample_collection'] = function (block) {
  var value_name = block.getFieldValue('name');
  var value_threshold = block.getFieldValue('threshold');

  var code = `createSampleCollection({name: "${value_name}", threshold: ${value_threshold}});\n`;

  return code;
}
