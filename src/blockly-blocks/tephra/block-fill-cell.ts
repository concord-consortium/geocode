import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import { HUE, SATURATION, VALUE, ALPHA } from '../../strings/blockly-blocks/tephra/fill-cell';

const { RIGHT } = Blockly.inputs.Align;

Blockly.Blocks.fill_cell = {
    init() {
      this.appendValueInput("hue")
          .setCheck("Number")
          .setAlign(RIGHT)
          .appendField(HUE);
      this.appendValueInput("sat")
          .setCheck("Number")
          .setAlign(RIGHT)
          .appendField(SATURATION);
      this.appendValueInput("value")
          .setCheck("Number")
          .setAlign(RIGHT)
          .appendField(VALUE);
      this.appendValueInput("alpha")
          .setCheck("Number")
          .setAlign(RIGHT)
          .appendField(ALPHA);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };

  javascriptGenerator.forBlock.fill_cell = function(block) {
    const hue = javascriptGenerator.valueToCode(block, 'hue', Order.ATOMIC);
    const sat = javascriptGenerator.valueToCode(block, 'sat', Order.ATOMIC);
    const value = javascriptGenerator.valueToCode(block, 'value', Order.ATOMIC);
    const alpha = javascriptGenerator.valueToCode(block, 'alpha', Order.ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    const code = `
      this.fill && this.fill( ${hue || 1}, ${sat || 50}, ${value || 50}, ${alpha || 10 });
    `;
    return code;
  };
  
