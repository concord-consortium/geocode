Blockly.Blocks['deformation-create-sim'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("Create Strain Simulation");
      this.appendDummyInput()
        .appendField("Set velocity of Block 1 with")
      this.appendValueInput('speed1')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("speed (mm/yr)")
        .setCheck(['Number'])
      this.appendValueInput('direction1')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("direction (degrees)")
        .setCheck(['Number'])
      this.appendDummyInput()
        .appendField("Set velocity of Block 2 with")
      this.appendValueInput('speed2')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("speed (mm/yr)")
      this.appendValueInput('direction2')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("direction (degrees)")
      this.setColour(15)
      this.setPreviousStatement(false, null);
      this.setNextStatement(false, null);
    }
  };

  Blockly.JavaScript['deformation-create-sim'] = function(plate) {
    var value_speed_1 = Blockly.JavaScript.valueToCode(plate, 'speed1', Blockly.JavaScript.ORDER_ATOMIC) || 0;
    var value_direction_1 = Blockly.JavaScript.valueToCode(plate, 'direction1', Blockly.JavaScript.ORDER_ATOMIC) || 0;
    var value_speed_2 = Blockly.JavaScript.valueToCode(plate, 'speed2', Blockly.JavaScript.ORDER_ATOMIC) || 0;
    var value_direction_2 = Blockly.JavaScript.valueToCode(plate, 'direction2', Blockly.JavaScript.ORDER_ATOMIC) || 0;


    var code = `setPlateVelocity({plate: 1, speed: ${value_speed_1}, direction: ${value_direction_1}});\n`;
    code += `setPlateVelocity({plate: 2, speed: ${value_speed_2}, direction: ${value_direction_2}});\n`;
    code +='runDeformationModel();\n';
    return code;
  }