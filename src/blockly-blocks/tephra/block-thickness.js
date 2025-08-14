import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import { THICKNESS } from "../../strings/blockly-blocks/tephra/thickness";

Blockly.Blocks.thickness = {
  init() {
    this.appendDummyInput()
      .appendField(THICKNESS);
    this.setOutput(true, null);
    this.setColour(230);
  this.setTooltip("");
  this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock.thickness = function(block) {
  // TODO: Assemble JavaScript into code variable.
  const code = `(this.thickness)`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, javascriptGenerator.ORDER_NONE];
};
