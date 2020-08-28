import * as Blockly from "blockly";

Blockly.Blocks['calculate_tephra_vei_wind'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Compute tephra depth at location")
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(new Blockly.FieldDropdown(this.generateOptions), "locations");
    this.appendValueInput("wind samples")
        .setCheck("Dataset")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("a random wind sample from");
    this.appendValueInput("vei")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("VEI");
    this.setOutput(true, "Sample");
    this.setColour(0);
    this.setTooltip("");
    this.setHelpUrl("");
  },

  generateOptions: function() {
    if (Blockly.sampleCollections && Blockly.sampleCollections.length > 0) {
      return Blockly.sampleLocations;
    } else {
      return [["<Create location>",""]];
    }
  }
};

Blockly.JavaScript['calculate_tephra_vei_wind'] = function(block) {
    var location = block.getFieldValue('locations');
    var wind_samples = Blockly.JavaScript.valueToCode(block, 'wind samples', Blockly.JavaScript.ORDER_ATOMIC) || "null";
    var value_vei = Blockly.JavaScript.valueToCode(block, 'vei', Blockly.JavaScript.ORDER_ATOMIC) || "undefined";

    var code = `computeTephra({location: "${location}", windSamples: ${wind_samples}, vei: ${value_vei}})`;

    return [code, Blockly.JavaScript.ORDER_NONE]
  };