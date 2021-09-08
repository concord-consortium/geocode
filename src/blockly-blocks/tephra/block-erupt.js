Blockly.Blocks['erupt'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Erupt with current values");
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#EB0000");
      this.setTooltip("have the volcano erupt");
      this.setHelpUrl("have the volcano erupt");
    }
  };

  Blockly.JavaScript['erupt'] = function(block) {
    var code = `
      erupt();
    `;
    return code;
  }
