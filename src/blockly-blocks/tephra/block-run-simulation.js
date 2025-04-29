import * as strings from '../../strings/blockly-blocks/tephra/run-simulation';

Blockly.Blocks.run_simulation = {
    init() {
      this.appendDummyInput()
          .appendField(strings.RUN_SIMULATION);
      this.appendValueInput("vei")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(strings.VEI);
      this.appendValueInput("wind_speed")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(strings.WIND_SPEED_MS);
      this.appendValueInput("wind_direction")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(strings.WIND_DIRECTION);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#EB0000");
      this.setTooltip(strings.SIMULATION_PARAMETERS);
      this.setHelpUrl("");
    }
  };

  Blockly.JavaScript.run_simulation = function(block) {
    const value_vei = Blockly.JavaScript.valueToCode(block, 'vei', Blockly.JavaScript.ORDER_ATOMIC);
    const value_wind_speed = Blockly.JavaScript.valueToCode(block, 'wind_speed', Blockly.JavaScript.ORDER_ATOMIC);
    const value_direction = Blockly.JavaScript.valueToCode(block, 'wind_direction', Blockly.JavaScript.ORDER_ATOMIC);
    const code = `
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
  };
