import * as Blockly from "blockly";

Blockly.Blocks['fill_cell'] = {
    init: function() {
      this.appendValueInput("hue")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("hue");
      this.appendValueInput("sat")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("saturation");
      this.appendValueInput("value")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("value");
      this.appendValueInput("alpha")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("alpha");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['fill_cell'] = function(block) {
    var hue = Blockly.JavaScript.valueToCode(block, 'hue', Blockly.JavaScript.ORDER_ATOMIC);
    var sat = Blockly.JavaScript.valueToCode(block, 'sat', Blockly.JavaScript.ORDER_ATOMIC);
    var value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
    var alpha = Blockly.JavaScript.valueToCode(block, 'alpha', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = `
      this.fill && this.fill( ${hue || 1}, ${sat || 50}, ${value || 50}, ${alpha || 10 });
    `;
    return code;
  }
