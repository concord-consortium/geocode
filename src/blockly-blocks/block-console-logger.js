Blockly.Blocks['console_logger'] = {
    init: function() {
      this.appendValueInput("logString")
          .setCheck("String")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("thingtoLog");
      this.setColour(165);
   this.setTooltip("Log something to the console");
   this.setHelpUrl("");
    }
  };
  
  Blockly.JavaScript['console_logger'] = function(block) {
    const value_logstring = Blockly.JavaScript.valueToCode(block, 'logString', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    const code = `console.log(${value_logstring});`;
    return code;
  }
  