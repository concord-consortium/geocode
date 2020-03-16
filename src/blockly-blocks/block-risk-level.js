Blockly.Blocks['show_risk'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Show risk on map for");
    this.appendDummyInput()
        .appendField("data collection")
        .appendField(new Blockly.FieldDropdown(this.generateOptions), "collections");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("above threshold")
        .appendField(new Blockly.FieldNumber(200), "threshold")
        .appendField("mm");
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
  var collection = block.getFieldValue('collections')
  var threshold = block.getFieldValue('threshold');

  var code = `showRisk({collection: "${collection}", threshold: ${threshold}});\n`
  return code
}