Blockly.Blocks['calculate_tephra_vei_wind'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Compute tephra thickness")
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("at location")
        .appendField(new Blockly.FieldDropdown(this.generateOptionsLoc), "locations");
    this.appendValueInput("wind samples")
        .setCheck("Dataset")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("a random wind sample from");
    this.appendValueInput("vei")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("VEI");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("add to data collection")
        .appendField(new Blockly.FieldDropdown(this.generateOptionsCol), "collections");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
    this.setTooltip("");
    this.setHelpUrl("");
  },

  generateOptionsLoc: function() {
    if (Blockly.sampleLocations && Blockly.sampleLocations.length > 0) {
      return Blockly.sampleLocations;
    } else {
      return [["<Create location>",""]];
    }
  },

  generateOptionsCol: function() {
    if (Blockly.sampleCollections && Blockly.sampleCollections.length > 0) {
      return Blockly.sampleCollections;
    } else {
      return [["<Create collection>",""]];
    }
  }
};

Blockly.JavaScript['calculate_tephra_vei_wind'] = function(block) {
    var location = block.getFieldValue('locations');
    var wind_samples = Blockly.JavaScript.valueToCode(block, 'wind samples', Blockly.JavaScript.ORDER_ATOMIC) || "null";
    var value_vei = Blockly.JavaScript.valueToCode(block, 'vei', Blockly.JavaScript.ORDER_ATOMIC) || "undefined";
    var collection = block.getFieldValue('collections')

    var code = `computeTephra({location: "${location}", windSamples: ${wind_samples}, vei: ${value_vei}, collection: "${collection}"});`;

    return code;
  };