Blockly.HSV_SATURATION=0.7;
Blockly.HSV_VALUE=.9;
Blockly.Msg.LOOPS_HUE=195;
Blockly.Msg.TEXTS_HUE=130;
Blockly.Msg.MATH_HUE=130;
Blockly.Msg.VARIABLES_HUE=130;
Blockly.Msg.VARIABLES_DYNAMIC_HUE=130;
Blockly.Blocks['erupt'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Erupt with current values");
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
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
