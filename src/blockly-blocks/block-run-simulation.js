Blockly.Blocks['run_sumilation'] = {
    init: function() {
      this.appendValueInput("mass")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Mass (kg)");
      this.appendValueInput("coumn_height")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Column Height (km)");
      this.appendValueInput("wind_speed")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Wind Speed (m/s)");
      this.appendValueInput("particle_size")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Particle Size");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Simulation parameters");
      this.setHelpUrl("");
    }
  }
  
  Blockly.JavaScript['run_sumilation'] = function(block) {
    var value_mass = Blockly.JavaScript.valueToCode(block, 'mass', Blockly.JavaScript.ORDER_ATOMIC);
    var value_coumn_height = Blockly.JavaScript.valueToCode(block, 'coumn_height', Blockly.JavaScript.ORDER_ATOMIC);
    var value_wind_speed = Blockly.JavaScript.valueToCode(block, 'wind_speed', Blockly.JavaScript.ORDER_ATOMIC);
    var value_particle_size = Blockly.JavaScript.valueToCode(block, 'particle_size', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = '...;\n';
    var code = `
      var mass=${value_mass};
      var modelParams = {
        mass: ${value_mass || 100},
        colHeight: ${value_coumn_height || 10},
        windSpeed: ${value_wind_speed || 0},
        particleSize: ${value_particle_size || 1}
      }
      // this.setModelParams(modelParams);
      this.setModelParams(modelParams);
    `;
    return code;
  }