import * as Blockly from "blockly";

Blockly.Blocks['addTown'] = {
    init: function() {
      this.appendValueInput("name")
          .setCheck("String")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Create a town named");
      this.appendDummyInput()
          .appendField("at");
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
      this.setColour(32);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['addTown'] = function(block) {
    var value_name = Blockly.JavaScript.valueToCode(block, 'name', Blockly.JavaScript.ORDER_ATOMIC);
    var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
    var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    value_x = value_x || 1;
    value_y = value_y || 1;
    value_name = value_name || "'untitled'"
    var code = `
      addCity({x: ${value_x}, y: ${value_y}, name: ${value_name}});
    `
    return code;
  }
