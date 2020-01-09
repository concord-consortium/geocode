Blockly.Blocks['simulate_wind'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Compute and visualize tephra with");
    this.appendValueInput("wspeed")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("wind speed (m/s)");
    this.appendValueInput("wdirection")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("wind direction (degrees)");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['simulate_wind'] = function(block) {
  var value_wspeed = Blockly.JavaScript.valueToCode(block, 'wspeed', Blockly.JavaScript.ORDER_ATOMIC);

  var value_wdirection = Blockly.JavaScript.valueToCode(block, 'wdirection', Blockly.JavaScript.ORDER_ATOMIC);

  var code = `
  this.setWindspeed(${value_wspeed || 0});
  this.setWindDirection(${value_wdirection || 0});
  this.erupt();
  this.paintMap();
`;
return code;
};