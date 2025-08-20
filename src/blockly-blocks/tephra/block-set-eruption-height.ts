import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import { SET_COLUMN_HEIGHT, KM } from "../../strings/blockly-blocks/tephra/controls-panel";

Blockly.Blocks.setEruptionHeight = {
  init() {
    this.appendValueInput("columnHeight")
        .setCheck("Number")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(SET_COLUMN_HEIGHT);
    this.appendDummyInput()
        .appendField(KM);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(32);
  this.setTooltip("");
  this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock.setEruptionHeight = function(block) {
  const value_columnHeight = javascriptGenerator.valueToCode(block, 'columnHeight', Order.ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  const code = `
    setColumnHeight(${value_columnHeight});
  `;
  return code;
};
