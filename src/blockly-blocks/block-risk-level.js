Blockly.Blocks['show_risk'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Show risk on graph for");
    this.appendDummyInput()
        .appendField("samples from")
        .appendField(new Blockly.FieldDropdown(this.generateOptions), "locations");
    this.appendValueInput("threshold")
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("exceeding (mm)");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  },

  generateOptions: function() {
    if (Blockly.sampleCollections && Blockly.sampleCollections.length > 0) {
      return Blockly.sampleCollections;
    } else {
      return [["<Create collection>",""]];
    }
  }
}
Blockly.JavaScript['show_risk'] = function (block) {
  var location = block.getFieldValue('locations')
  var threshold = Blockly.JavaScript.valueToCode(block, 'threshold', Blockly.JavaScript.ORDER_ATOMIC) || 0;

  var code = `showRisk({location: "${location}", threshold: ${threshold}});\n`
  return code
}