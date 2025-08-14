import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import { CLEAR, CLEAR_TOOLTIP } from "../strings/blockly-blocks/all-other-blocks";

Blockly.Blocks.clear = {
  init() {
    this.appendValueInput("logString")
      .setCheck("String")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(CLEAR);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(165);
  this.setTooltip(CLEAR_TOOLTIP);
  this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock.clear = function(block) {
  const code ='clearCanvas();\n';
  return code;
};
