import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import { PRINT, TO_LOG, PRINT_TOOLTIP } from "../strings/blockly-blocks/all-other-blocks";

Blockly.Blocks.logprint = {
  init() {
    this.appendDummyInput()
      .appendField(PRINT);
    this.appendValueInput("data")
      .setCheck(null);
    this.appendDummyInput()
      .appendField(TO_LOG);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip(PRINT_TOOLTIP);
    this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock.logprint = function(block) {
  const value_data = javascriptGenerator.valueToCode(block, 'data', Order.ATOMIC);
  const code = `logInfo(${value_data});`;
  return code;
};
