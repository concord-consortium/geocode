import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import { CREATE_VOLCANO } from '../../strings/blockly-blocks/tephra/add-volcano';

Blockly.Blocks.addVolcano = {
  init() {
    this.appendDummyInput()
        .appendField(CREATE_VOLCANO);
    this.appendValueInput("x")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("x");
    this.appendValueInput("y")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("y");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#EB0000");
this.setTooltip("");
this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock.addVolcano = function(block) {
  let value_x = javascriptGenerator.valueToCode(block, 'x', javascriptGenerator.ORDER_ATOMIC);
  let value_y = javascriptGenerator.valueToCode(block, 'y', javascriptGenerator.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  value_x = value_x || 10;
  value_y = value_y || 10;
  const code = `
    setVolcano({x: ${value_x}, y: ${value_y}});
  `;
  // console.log(code);
  return code;
};
