import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import { SET_WIND_DIRECTION, DEGREES, WIND_TOOLTIP } from "../../strings/blockly-blocks/tephra/controls-panel";

Blockly.Blocks.setWindDirection = {
  init() {
    this.appendValueInput("windDirection")
      .setCheck("Number")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField(SET_WIND_DIRECTION);
    this.appendDummyInput()
      .appendField(DEGREES);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(32);
    this.setTooltip(WIND_TOOLTIP);
    this.setHelpUrl(WIND_TOOLTIP);
  }
};

javascriptGenerator.forBlock.setWindDirection = function(block) {
  const value_winddirection = javascriptGenerator.valueToCode(block, 'windDirection', Order.ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  const code = `
    setWindDirection(${value_winddirection});

  `;
  return code;
};
