Blockly.Blocks['clear'] = {
    init: function() {
      this.appendValueInput("logString")
          .setCheck("String")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("clear");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(165);
   this.setTooltip("clear the screen");
   this.setHelpUrl("");
    }
  };
  
  Blockly.JavaScript['clear'] = function(block) {
    const code ='clearCanvas();\n';
    return code;
  }