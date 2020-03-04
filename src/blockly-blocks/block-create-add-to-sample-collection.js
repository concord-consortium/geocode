Blockly.Blocks['create_sample_collection'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Create a samples collection")
    this.appendDummyInput()
        .appendField("for a location named")
        .appendField(new Blockly.FieldTextInput("Name"), "name");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("at x")
        .appendField(new Blockly.FieldNumber(0), "x");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("y")
        .appendField(new Blockly.FieldNumber(0), "y");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(240);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['create_sample_collection'] = function (block) {
  var value_name = block.getFieldValue('name');
  var value_x = block.getFieldValue('x');
  var value_y = block.getFieldValue('y');

  var code = `createSampleCollection({name: "${value_name}", x: ${value_x}, y: ${value_y}});\n`;

  return code;
}

Blockly.Blocks['add_to_sample_collection'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Add sample for")
    this.appendValueInput('tephra sample')
      .setAlign(Blockly.ALIGN_RIGHT)
      .setCheck('Sample')
      .appendField(new Blockly.FieldDropdown(
        this.generateOptions), "collections")
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(240)
    this.setTooltip('')
    this.setHelpUrl('')
  },

  generateOptions: function() {
    if (Blockly.sampleCollections && Blockly.sampleCollections.length > 0) {
      return Blockly.sampleCollections;
    } else {
      return [["<Create collection>",""]];
    }
  }
}
Blockly.JavaScript['add_to_sample_collection'] = function (block) {
  var tephra_sample = Blockly.JavaScript.valueToCode(block, 'tephra sample', Blockly.JavaScript.ORDER_ATOMIC) || null
  var collection = block.getFieldValue('collections')

  var code = `addToSampleCollection({name: "${collection}", sample: ${tephra_sample}});\n`
  return code
}