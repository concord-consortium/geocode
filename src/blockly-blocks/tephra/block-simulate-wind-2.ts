import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import * as strings from "../../strings/blockly-blocks/tephra/simulate-wind";

const { RIGHT } = Blockly.inputs.Align;

Blockly.Blocks.simulate_wind_2 = {
  init() {
    this.appendDummyInput()
      .appendField(strings.COMPUTE_TEPHRA);
    this.appendValueInput("wspeed")
      .setCheck("Number")
      .setAlign(RIGHT)
      .appendField(strings.WIND_SPEED);
    this.appendValueInput("wdirection")
      .setCheck("Number")
      .setAlign(RIGHT)
      .appendField(strings.WIND_DIRECTION);
    this.appendValueInput("columnheight")
      .setCheck("Number")
      .setAlign(RIGHT)
      .appendField(strings.COLUMN_HEIGHT);
    this.appendValueInput("ejectedvolume")
      .setCheck("Number")
      .setAlign(RIGHT)
      .appendField(strings.EJECTED_VOLUME);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#EB0000");
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock.simulate_wind_2 = function(block) {
  const value_wspeed = javascriptGenerator.valueToCode(block, 'wspeed', Order.ATOMIC);
  const value_wdirection = javascriptGenerator.valueToCode(block, 'wdirection', Order.ATOMIC);
  const value_columnheight = javascriptGenerator.valueToCode(block, 'columnheight', Order.ATOMIC);
  const value_ejectedvolume = javascriptGenerator.valueToCode(block, 'ejectedvolume', Order.ATOMIC);

  const code = `
  this.setWindspeed(${value_wspeed});
  this.setWindDirection(${value_wdirection});
  this.setColumnHeight(${value_columnheight});
  this.setVolume(${value_ejectedvolume});
  this.erupt();
  this.paintMap();
`;
  return code;
};
