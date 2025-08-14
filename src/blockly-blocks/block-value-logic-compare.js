import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";

// This is another version of the built-in logic_compare block which allows us to pass in blocks that return code.
// The value_compare block doesn't handle this well, because of the way our interpreter wraps the results of
// code blocks.
// Using the value-logic-compare block we can compare any block with the output "Number", and any pure number, and
// mix-and-match as desired.

Blockly.Blocks['value-logic-compare'] = {
  init() {
    this.appendValueInput("x")
      .setCheck("Number")
      .setAlign(Blockly.ALIGN_RIGHT);
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        ["=", "equals"],
        ["\u2260", "notEquals"],
        ["<", "lessThan"],
        ["\u2264", "lessThanOrEqual"],
        [">", "greaterThan"],
        ["\u2265", "greaterThanOrEqual"]]), "OP");
    this.appendValueInput("y")
      .setCheck("Number")
      .setAlign(Blockly.ALIGN_RIGHT);
    this.setInputsInline(true);

    this.setOutput(true, 'Boolean');
    this.setColour("%{BKY_LOGIC_HUE}");
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock['value-logic-compare'] = function(block) {
  let x;
  let y;
  try {
    x = javascriptGenerator.statementToCode(block, 'x');
  } catch {
    x = javascriptGenerator.valueToCode(block, 'x', javascriptGenerator.ORDER_ATOMIC) || null;
  }
  try {
    y = javascriptGenerator.statementToCode(block, 'y');
  } catch {
    y = javascriptGenerator.valueToCode(block, 'y', javascriptGenerator.ORDER_ATOMIC) || null;
  }

  if (x === undefined || x === null || x === "") x = "null";
  if (y === undefined || y === null || y === "") y= "null";
  const operation = block.getFieldValue('OP');
  const code = `${operation}({left: ${x}, right: ${y}})`;
  return [code, javascriptGenerator.ORDER_NONE];
};
