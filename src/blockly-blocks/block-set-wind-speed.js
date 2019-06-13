Blockly.Blocks['setWindSpeed'] = {
    init: function() {
      this.appendValueInput("windSpeed")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Set wind speed");
      this.appendDummyInput()
          .appendField("m/s");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(150);
   this.setTooltip("wind speed, meters per second");
   this.setHelpUrl("wind speed, meters per second");
    }
  };
  
  Blockly.JavaScript['setWindSpeed'] = function(block) {
    var value_wind_speed = Blockly.JavaScript.valueToCode(block, 'windSpeed', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = `
      setWindspeed(${value_wind_speed});
  
    `;
    return code;
  }
  