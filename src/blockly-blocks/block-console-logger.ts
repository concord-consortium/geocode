import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
// import { THING_TO_LOG, LOG_TOOLTIP } from "../strings/blockly-blocks/all-other-blocks";

Blockly.Blocks.console_logger = {
  init() {
    this.appendValueInput("logString")
      .setCheck("String")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("thingtoLog");
    this.setColour(165);
  this.setTooltip("Log something to the console");
  this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock.console_logger = function(block) {
  const value_logstring = javascriptGenerator.valueToCode(block, 'logString', Order.ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  const code = `console.log(${value_logstring});`;
  return code;
};
