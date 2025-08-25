import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import { SET_VEI, VEI_EXPLAINED } from "../../strings/blockly-blocks/tephra/controls-panel";

Blockly.Blocks.setVEI = {
  init() {
    this.appendValueInput("vei")
      .setCheck("Number")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField(SET_VEI);
    this.appendDummyInput();
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(32);
    this.setTooltip(VEI_EXPLAINED);
    this.setHelpUrl(VEI_EXPLAINED);
  }
};

javascriptGenerator.forBlock.setVei = function(block) {
  const vei = javascriptGenerator.valueToCode(block, 'vei', Order.ATOMIC);

  const code = `
    setVei(${vei});
  `;
  return code;
};
