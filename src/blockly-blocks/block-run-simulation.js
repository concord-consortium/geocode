Blockly.Blocks['run_simulation'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Run simulation");
      this.appendValueInput("vei")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("VEI");
      this.appendValueInput("wind_speed")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Wind Speed (m/s)");
      this.appendValueInput("wind_direction")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Wind Direction");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
      this.setTooltip("Simulation parameters");
      this.setHelpUrl("");
    }
  }

  Blockly.JavaScript['run_simulation'] = function(block) {
    var value_vei = Blockly.JavaScript.valueToCode(block, 'vei', Blockly.JavaScript.ORDER_ATOMIC);
    var value_wind_speed = Blockly.JavaScript.valueToCode(block, 'wind_speed', Blockly.JavaScript.ORDER_ATOMIC);
    var value_direction = Blockly.JavaScript.valueToCode(block, 'wind_direction', Blockly.JavaScript.ORDER_ATOMIC);
    var code = `
      var vei=${value_vei};
      var speed=${value_wind_speed};
      var direction=${value_direction};
      this.setVEI(vei);
      this.setWindspeed(speed);
      this.setWindDirection(direction);
      this.erupt();
      this.paintMap();
    `;
    return code;
  }