import * as strings from '../../strings/blockly-blocks/tephra/create-add-to-sample-collection'

Blockly.Blocks['create_sample_location'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(strings.CREATE_LOCATION)
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.AT_X)
        .appendField(new Blockly.FieldNumber(0), "x")
        .appendField(strings.KM);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.Y)
        .appendField(new Blockly.FieldNumber(0), "y")
        .appendField(strings.KM);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.NAMED)
        .appendField(new Blockly.FieldTextInput(strings.LOCATION), "name");
    this.appendDummyInput()
        .appendField(strings.MARK_MAP)
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
        .appendField(strings.CREATE_COLLECTION)
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.NAMED)
        .appendField(new Blockly.FieldTextInput("Name"), "name");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.SET_THRESHOLD)
        .appendField(new Blockly.FieldNumber(200), "threshold")
        .appendField(strings.MM);
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
