import * as strings from "../../strings/blockly-blocks/tephra/simulate-wind";

Blockly.Blocks.simulate_wind_height = {
  init() {
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
    this.appendValueInput("columnheight")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.COLUMN_HEIGHT);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#EB0000");
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript.simulate_wind_height = function(block) {
  const value_wspeed = Blockly.JavaScript.valueToCode(block, 'wspeed', Blockly.JavaScript.ORDER_ATOMIC);

  const value_wdirection = Blockly.JavaScript.valueToCode(block, 'wdirection', Blockly.JavaScript.ORDER_ATOMIC);

  const value_columnheight = Blockly.JavaScript.valueToCode(block, 'columnheight', Blockly.JavaScript.ORDER_ATOMIC);

  const code = `
  this.setWindspeed(${value_wspeed});
  this.setWindDirection(${value_wdirection});
  this.setColumnHeight(${value_columnheight});
  this.erupt();
  this.paintMap();
`;
return code;
};
