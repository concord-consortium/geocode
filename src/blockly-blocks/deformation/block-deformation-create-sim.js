Blockly.Blocks['deformation-create-sim'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("Create Deformation Simulation");
      this.appendDummyInput()
        .appendField("Set velocity of Plate 1 with")
      this.appendValueInput('speed1')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("speed (mm/yr)")
        .setCheck(['Number'])
      this.appendValueInput('direction1')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("direction (degrees)")
        .setCheck(['Number', 'String'])
      this.appendDummyInput()
        .appendField("Set velocity of Plate 2 with")
      this.appendValueInput('speed2')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("speed (mm/yr)")
        .setCheck(['Number'])
      this.appendValueInput('direction2')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("direction (degrees)")
        .setCheck(['Number', 'String'])
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

  Blockly.Blocks['deformation-year-loop'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Count with Years from 0 to ")
          .appendField(new Blockly.FieldNumber(500, 0, 500000), "max_year")
          .appendField("by")
          .appendField(new Blockly.FieldDropdown([["1","1"], ["10","10"], ["20","20"]]), "year_step");
      this.appendStatementInput("DO")
          .setCheck(null);
      this.setPreviousStatement(false, null);
      this.setNextStatement(false, null);
      this.setColour("%{BKY_LOOPS_HUE}");
   this.setTooltip("Step through deformation model for a given number of years, with a given step size");
   this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['deformation-year-loop'] = function(block) {
    var number_max_year = block.getFieldValue('max_year');
    var dropdown_year_step = block.getFieldValue('year_step');
    var branch = Blockly.JavaScript.statementToCode(block, 'DO');

    var code = '';

    code += 'for (var year = ' + dropdown_year_step + '; ' +
        'year <= ' + number_max_year + '; ' +
        'year += ' + dropdown_year_step + ') {\n' +
        branch +
        '}\n';
    return code;
  };

  Blockly.Blocks['deformation-model-step'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Increase Deformation by deformation rate");
      this.appendDummyInput()
          .appendField("  calculated based on");
      this.appendValueInput("speed1")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Plate 1 speed");
      this.appendValueInput("speed2")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Plate 2 speed");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(15);
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
          .appendField("Trigger earthquake to release energy");
      this.appendDummyInput()
          .appendField("and set Deformation to 0");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(15);
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
          .appendField("Deformation");
      this.setOutput(true, 'Number');
      this.setColour(15);
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
          .appendField("Compute max deformation with")
          .appendField(new Blockly.FieldDropdown([["low", "low"], ["medium", "medium"], ["high", "high"]]), "friction")
          .appendField("friction");
      this.setOutput(true, 'Number');
      this.setColour(15);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['deformation-model-get-max-deformation'] = function(block) {
    var friction = block.getFieldValue('friction');
    var code = `getMaxDeformation("${friction}")`;
  return [code, Blockly.JavaScript.ORDER_NONE];
  };
