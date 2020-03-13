Blockly.Blocks['show_risk'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Show risk on map for");
    this.appendDummyInput()
        .appendField("samples from")
        .appendField(new Blockly.FieldDropdown(this.generateOptions), "locations");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("exceeding")
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
  var location = block.getFieldValue('locations')
  var threshold = block.getFieldValue('threshold');

  var code = `showRisk({location: "${location}", threshold: ${threshold}});\n`
  return code
}