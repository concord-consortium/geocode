Blockly.Blocks['addVolcano'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Create the volcano at");
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
      this.setColour(230);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };
  
  Blockly.JavaScript['addVolcano'] = function(block) {
    var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
    var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    value_x = value_x || 10;
    value_y = value_y || 10;
    var code = `
      setVolcano({x: ${value_x}, y: ${value_y}});
    `
    console.log(code);
    return code;
  }
  