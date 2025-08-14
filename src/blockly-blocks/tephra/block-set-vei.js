import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import { SET_VEI, VEI_EXPLAINED } from "../../strings/blockly-blocks/tephra/controls-panel";

Blockly.Blocks.setVEI = {
  init() {
    this.appendValueInput("vei")
      .setCheck("Number")
      .setAlign(Blockly.ALIGN_RIGHT)
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

javascriptGenerator.forBlock.setFoo = function(block) {
  const foo = javascriptGenerator.valueToCode(block, 'foo', javascriptGenerator.ORDER_ATOMIC);

  if (foo === "") {
    window.blocklyErrorMessage = "You are missing an input for 'Foo'";
  }

  // [...]
};
