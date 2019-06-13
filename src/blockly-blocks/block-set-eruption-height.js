Blockly.Blocks['setEruptionHeight'] = {
    init: function() {
      this.appendValueInput("eruptionHeight")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Set eruption height");
      this.appendDummyInput()
          .appendField("km");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(150);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };
  
  Blockly.JavaScript['setEruptionHeight'] = function(block) {
    var value_eruptionHeight = Blockly.JavaScript.valueToCode(block, 'eruptionHeight', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = '//...;\n';
    return code;
  }
  