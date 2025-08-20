import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";

Blockly.Blocks.stringconcat = {
  init() {
    this.appendValueInput("lv")
      .setCheck(null);
    this.appendDummyInput()
      .appendField("+");
    this.appendValueInput("rv")
      .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, "String");
    this.setColour(260);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock.stringconcat = function(block) {
  const value_lv = javascriptGenerator.valueToCode(block, 'lv', Order.ATOMIC);
  const value_rv = javascriptGenerator.valueToCode(block, 'rv', Order.ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  let code = ``;
  if (value_lv || value_rv) {
    code = ` stringConcat({lv: ${value_lv ? value_lv : null}, rv: ${value_rv ? value_rv : null}}) \n`;
  }
  return [code, Order.FUNCTION_CALL];
};
