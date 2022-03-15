import * as strings from "../../strings/blockly-blocks/tephra/simulate-wind"

Blockly.Blocks['simulate_wind'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(strings.COMPUTE_TEPHRA);
    this.appendValueInput("wspeed")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.WIND_SPEED);
    this.appendValueInput("wdirection")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.WIND_DIRECTION);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#EB0000");
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['simulate_wind'] = function(block) {
  var value_wspeed = Blockly.JavaScript.valueToCode(block, 'wspeed', Blockly.JavaScript.ORDER_ATOMIC);

  var value_wdirection = Blockly.JavaScript.valueToCode(block, 'wdirection', Blockly.JavaScript.ORDER_ATOMIC);

  var code = `
  this.setWindspeed(${value_wspeed});
  this.setWindDirection(${value_wdirection});
  this.erupt();
  this.paintMap();
`;
return code;
};