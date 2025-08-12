import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";

Blockly.Blocks.x = {
  init() {
    this.appendDummyInput()
      .appendField("X");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
  
javascriptGenerator.forBlock.x = function(block) {
  // TODO: Assemble JavaScript into code variable.
  const code = `(this.x)`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, javascriptGenerator.ORDER_NONE];
};

Blockly.Blocks.y = {
  init() {
    this.appendDummyInput()
      .appendField("Y");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock.y = function(block) {
  // TODO: Assemble JavaScript into code variable.
  const code = `(this.y)`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, javascriptGenerator.ORDER_NONE];
};
