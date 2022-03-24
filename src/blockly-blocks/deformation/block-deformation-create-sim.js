import * as strings from '../../strings/blockly-blocks/deformation/deformation';

Blockly.Blocks['deformation-create-sim'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(strings.CREATE_DEFORMATION_SIMULATION);
      this.appendDummyInput()
        .appendField(strings.SET_VELOCITY_OF_PLATE_1_WITH)
      this.appendValueInput('speed1')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.SPEED_MM_YR)
        .setCheck(['Number'])
      this.appendValueInput('direction1')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.DIRECTION_DEGREES)
        .setCheck(['Number', 'String'])
      this.appendDummyInput()
        .appendField(strings.SET_VELOCITY_OF_PLATE_2_WITH)
      this.appendValueInput('speed2')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.SPEED_MM_YR)
        .setCheck(['Number'])
      this.appendValueInput('direction2')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.DIRECTION_DEGREES)
        .setCheck(['Number', 'String'])
      this.setColour("#B35F00")
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
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

  Blockly.Blocks['deformation-year-loop'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(strings.RUN_FROM_YEAR_1)
          .appendField(new Blockly.FieldNumber(500, 0, 500000), "max_year")
          .appendField(strings.BY)
          .appendField(new Blockly.FieldDropdown([["1","1"], ["10","10"], ["20","20"]]), "year_step")
          .appendField(strings.YEARS);
      this.appendStatementInput("DO")
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#B35F00")
      this.setTooltip(strings.STEP_THROUGH);
      this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['deformation-year-loop'] = function(block) {
    var number_max_year = block.getFieldValue('max_year');
    var dropdown_year_step = block.getFieldValue('year_step');
    var branch = Blockly.JavaScript.statementToCode(block, 'DO');

    var code = 'createNewRun();\n';

    code += 'for (var year = ' + dropdown_year_step + '; ' +
        'year <= ' + number_max_year + '; ' +
        'year += ' + dropdown_year_step + ') {\n' +
        branch +
        '};\n';
    return code;
  };

  Blockly.Blocks['deformation-model-step'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(strings.INCREASE_DEFORMATION);
      this.appendDummyInput()
          .appendField(strings.CALCULATED_BASED_ON);
      this.appendValueInput("speed1")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(strings.PLATE1_SPEED);
      this.appendDummyInput()
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(strings.DIRECTION_MODEL_1);
      this.appendValueInput("speed2")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(strings.PLATE2_SPEED);
      this.appendDummyInput()
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(strings.DIRECTION_MODEL_2);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#B35F00")
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['deformation-model-step'] = function(block) {
    var value_speed1 = Blockly.JavaScript.valueToCode(block, 'speed1', Blockly.JavaScript.ORDER_ATOMIC) || 0;

    var value_speed2 = Blockly.JavaScript.valueToCode(block, 'speed2', Blockly.JavaScript.ORDER_ATOMIC) || 0;

    var code = `
      stepDeformationModel({year: year, plate_1_speed: ${value_speed1}, plate_2_speed: ${value_speed2}});
  `;
  return code;
  };

  Blockly.Blocks['deformation-model-earthquake'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(strings.TRIGGER_EARTHQUAKE);
      this.appendDummyInput()
          .appendField(strings.SET_DEFORMATION);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#B35F00")
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['deformation-model-earthquake'] = function(block) {
    var code = `
      triggerEarthquake();
  `;
  return code;
  };

  Blockly.Blocks['deformation-model-get-deformation'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(strings.DEFORMATION);
      this.setOutput(true, 'Number');
      this.setColour("#B35F00")
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['deformation-model-get-deformation'] = function(block) {
    var code = `getDeformation()`;
  return [code, Blockly.JavaScript.ORDER_NONE];
  };


  Blockly.Blocks['deformation-model-get-max-deformation'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(strings.MAX_DEFORMATION)
          .appendField(new Blockly.FieldDropdown([["low", "low"], ["medium", "medium"], ["high", "high"]]), strings.FRICTION)
          .appendField(strings.FRICTION);
      this.setOutput(true, 'Number');
      this.setColour("#B35F00")
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['deformation-model-get-max-deformation'] = function(block) {
    var friction = block.getFieldValue('friction');
    var code = `getMaxDeformation("${friction}")`;
  return [code, Blockly.JavaScript.ORDER_NONE];
  };

  Blockly.Blocks['deformation-boundary-orientation'] = {
    init: function () {
      this.appendValueInput('orientation')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.SET_BOUNDARY)
        .setCheck(['Number'])
      this.setColour("#B35F00")
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
    }
  };

  Blockly.JavaScript['deformation-boundary-orientation'] = function(plate) {
    var value_orientation = Blockly.JavaScript.valueToCode(plate, 'orientation', Blockly.JavaScript.ORDER_ATOMIC) || 0;

    var code = `setBoundaryOrientation(${value_orientation});\n`;
    return code;
  }