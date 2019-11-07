Blockly.Blocks['setVEI'] = {
    init: function() {
      this.appendValueInput("vei")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Set VEI (1-8)");
      this.appendDummyInput();
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(150);
      this.setTooltip("Volcanic Explosivity Index");
      this.setHelpUrl("Volcanic Explosivity Index");
    }
  };

  Blockly.JavaScript['setVEI'] = function(block) {
    var value_vei = Blockly.JavaScript.valueToCode(block, 'vei', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = `
      setVEI(${value_vei});

    `;
    return code;
  }
