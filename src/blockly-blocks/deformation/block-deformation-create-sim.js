Blockly.Blocks['deformation-create-sim'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("Create Strain Simulation");
      this.setColour(15)
      this.setPreviousStatement(false, null);
      this.setNextStatement(true, null);
    }
  };

  Blockly.JavaScript['deformation-create-sim'] = function(block) {
    const code ='createDeformationModel();\n';
    return code;
  }

  Blockly.Blocks['set_velocity_block_1'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Set velocity Block 1 with")
      this.appendValueInput('speed')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("speed (mm/yr)")
        .setCheck(['Number'])
      this.appendValueInput('direction')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("direction (degrees)")
        .setCheck(['Number'])
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(240);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['set_velocity_block_1'] = function (block) {
    var value_speed = Blockly.JavaScript.valueToCode(block, 'speed', Blockly.JavaScript.ORDER_ATOMIC) || 0;
    var value_direction = Blockly.JavaScript.valueToCode(block, 'direction', Blockly.JavaScript.ORDER_ATOMIC) || 0;

    var code = `setBlockVelocity({block: 1, speed: ${value_speed}, direction: ${value_direction}});\n`;
    return code;
  }

  Blockly.Blocks['set_velocity_block_2'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Set velocity Block 2 with")
      this.appendValueInput('speed')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("speed (mm/yr)")
      this.appendValueInput('direction')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("direction (degrees)")
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(240);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['set_velocity_block_2'] = function (block) {
    var value_speed = Blockly.JavaScript.valueToCode(block, 'speed', Blockly.JavaScript.ORDER_ATOMIC) || 0;
    var value_direction = Blockly.JavaScript.valueToCode(block, 'direction', Blockly.JavaScript.ORDER_ATOMIC) || 0;

    var code = `setBlockVelocity({block: 2, speed: ${value_speed}, direction: ${value_direction}});\n`;
    return code;
  }