Blockly.Blocks['simulate_wind_sample_vei'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Compute and visualize tephra with");
        this.appendValueInput("wind samples")
        .setCheck("Dataset")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("a random wind sample from");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['simulate_wind_sample_vei'] = function(block) {
  var dataset = Blockly.JavaScript.valueToCode(block, 'wind samples', Blockly.JavaScript.ORDER_ATOMIC) || "null";

  var code = `
    var windSample = getSingleSample(${dataset});
    this.setWindspeedAndDirection(windSample);
    this.setVEI(4);
    this.erupt();
    this.paintMap();
`;
return code;
};