import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import { SET_EJECTED_VOLUME, KM_CUBED } from '../../strings/blockly-blocks/tephra/controls-panel';

Blockly.Blocks.setEjectedVolume = {
  init() {
    this.appendValueInput("ejectedVolume")
        .setCheck("Number")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(SET_EJECTED_VOLUME);
    this.appendDummyInput()
        .appendField(KM_CUBED);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(32);
  this.setTooltip("");
  this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock.setEjectedVolume = function(block) {
  const value_volume = javascriptGenerator.valueToCode(block, 'ejectedVolume', Order.ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  const code = `
    setVolume(${value_volume});
  `;
  return code;
};
