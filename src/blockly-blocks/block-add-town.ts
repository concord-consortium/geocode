import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import { CREATE_TOWN, AT, X, Y } from "../strings/blockly-blocks/all-other-blocks";

const { RIGHT } = Blockly.inputs.Align;

Blockly.Blocks.addTown = {
  init() {
    this.appendValueInput("name")
      .setCheck("String")
      .setAlign(RIGHT)
      .appendField(CREATE_TOWN);
    this.appendDummyInput()
      .appendField(AT);
    this.appendValueInput("x")
      .setCheck("Number")
      .setAlign(RIGHT)
      .appendField(X);
    this.appendValueInput("y")
      .setCheck("Number")
      .setAlign(RIGHT)
      .appendField(Y);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#EB0000");
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock.addTown = function(block) {
  let value_name = javascriptGenerator.valueToCode(block, 'name', Order.ATOMIC);
  let value_x = javascriptGenerator.valueToCode(block, 'x', Order.ATOMIC);
  let value_y = javascriptGenerator.valueToCode(block, 'y', Order.ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  value_x = value_x || "1";
  value_y = value_y || "1";
  value_name = value_name || "'untitled'";
  const code = `
    addCity({x: ${value_x}, y: ${value_y}, name: ${value_name}});
  `;
  return code;
};
