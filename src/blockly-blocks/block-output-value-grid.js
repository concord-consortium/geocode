Blockly.Blocks['outputValueGrid'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Number the grid by")
        .appendField(new Blockly.FieldDropdown([["tephra thickness", "thickness"]]), "result_type");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
  this.setTooltip("Number the results of the simulation in the grid with a value");
  this.setHelpUrl("");
  }
};
  
Blockly.JavaScript['outputValueGrid'] = function(block) {
  var resultType = block.getFieldValue('result_type');
  // TODO: Assemble JavaScript into code variable.
  var code = `
    numberGrid({resultType: "${resultType}"});
  `;
  return code;
}
  