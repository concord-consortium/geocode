Blockly.Blocks['setEjectedVolume'] = {
    init: function() {
      this.appendValueInput("ejectedVolume")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Set ejected volume");
      this.appendDummyInput()
          .appendField("km\u00B3");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(32);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['setEjectedVolume'] = function(block) {
    var value_volume = Blockly.JavaScript.valueToCode(block, 'ejectedVolume', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = `
      setVolume(${value_volume});
    `;
    return code;
  }
