import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import { ERUPT_CURRENT, VOLCANO_ERUPT } from "../../strings/blockly-blocks/tephra/erupt";

Blockly.Blocks.erupt = {
  init() {
    this.appendDummyInput()
        .appendField(ERUPT_CURRENT);
    this.setInputsInline(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#EB0000");
    this.setTooltip(VOLCANO_ERUPT);
    this.setHelpUrl(VOLCANO_ERUPT);
  }
};

javascriptGenerator.forBlock.erupt = function(block) {
  const code = `
    erupt();
  `;
  return code;
};
