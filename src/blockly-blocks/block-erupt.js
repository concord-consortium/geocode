Blockly.Blocks['erupt'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Erupt with current values");
      this.appendDummyInput()
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(new Blockly.FieldCheckbox("TRUE"), "animate")
          .appendField("Show animation");
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
   this.setTooltip("have the volcano erupt");
   this.setHelpUrl("have the volcano erupt");
    }
  };
  
  Blockly.JavaScript['erupt'] = function(block) {
    var animate = block.getFieldValue('animate') == 'TRUE';
    var code = `
      erupt(${animate});
    `;
    return code;
  }
  