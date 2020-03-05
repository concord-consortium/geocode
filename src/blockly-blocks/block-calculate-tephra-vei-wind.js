Blockly.Blocks['calculate_tephra_vei_wind'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Compute tephra depth at location")
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(new Blockly.FieldDropdown(this.generateOptions), "collections");
    this.appendValueInput("vei")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("VEI");
    this.appendValueInput("wind samples")
        .setCheck("Dataset")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("a random wind sample from");
    this.setOutput(true, "Sample");
    this.setColour(0);
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
};

Blockly.JavaScript['calculate_tephra_vei_wind'] = function(block) {
    var collection = block.getFieldValue('collections');
    var wind_samples = Blockly.JavaScript.valueToCode(block, 'wind samples', Blockly.JavaScript.ORDER_ATOMIC) || "null";
    var value_vei = Blockly.JavaScript.valueToCode(block, 'vei', Blockly.JavaScript.ORDER_ATOMIC) || 0;

    var code = `computeTephra({collection: "${collection}", windSamples: ${wind_samples}, vei: ${value_vei}})`;

    return [code, Blockly.JavaScript.ORDER_NONE]
  };