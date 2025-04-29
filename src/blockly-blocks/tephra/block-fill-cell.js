import { HUE, SATURATION, VALUE, ALPHA } from '../../strings/blockly-blocks/tephra/fill-cell';

Blockly.Blocks.fill_cell = {
    init() {
      this.appendValueInput("hue")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(HUE);
      this.appendValueInput("sat")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(SATURATION);
      this.appendValueInput("value")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(VALUE);
      this.appendValueInput("alpha")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(ALPHA);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };
  
  Blockly.JavaScript.fill_cell = function(block) {
    const hue = Blockly.JavaScript.valueToCode(block, 'hue', Blockly.JavaScript.ORDER_ATOMIC);
    const sat = Blockly.JavaScript.valueToCode(block, 'sat', Blockly.JavaScript.ORDER_ATOMIC);
    const value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
    const alpha = Blockly.JavaScript.valueToCode(block, 'alpha', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    const code = `
      this.fill && this.fill( ${hue || 1}, ${sat || 50}, ${value || 50}, ${alpha || 10 });
    `;
    return code;
  };
  
