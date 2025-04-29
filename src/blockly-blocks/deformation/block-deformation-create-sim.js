import * as strings from "../../strings/blockly-blocks/deformation/deformation";

Blockly.Blocks['deformation-create-sim'] = {
    init () {
      this.appendDummyInput()
        .appendField(strings.CREATE_DEFORMATION_SIMULATION);
      this.appendDummyInput()
        .appendField(strings.SET_VELOCITY_OF_PLATE_1_WITH);
      this.appendValueInput('speed1')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.SPEED_MM_YR)
        .setCheck(['Number']);
      this.appendValueInput('direction1')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.DIRECTION_DEGREES)
        .setCheck(['Number', 'String']);
      this.appendDummyInput()
        .appendField(strings.SET_VELOCITY_OF_PLATE_2_WITH);
      this.appendValueInput('speed2')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.SPEED_MM_YR)
        .setCheck(['Number']);
      this.appendValueInput('direction2')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.DIRECTION_DEGREES)
        .setCheck(['Number', 'String']);
      this.setColour("#B35F00");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
    }
  };

  Blockly.JavaScript['deformation-create-sim'] = function(plate) {
    const value_speed_1 = Blockly.JavaScript.valueToCode(plate, 'speed1', Blockly.JavaScript.ORDER_ATOMIC) || 0;
    const value_direction_1 = Blockly.JavaScript.valueToCode(plate, 'direction1', Blockly.JavaScript.ORDER_ATOMIC) || 0;
    const value_speed_2 = Blockly.JavaScript.valueToCode(plate, 'speed2', Blockly.JavaScript.ORDER_ATOMIC) || 0;
    const value_direction_2 = Blockly.JavaScript.valueToCode(plate, 'direction2', Blockly.JavaScript.ORDER_ATOMIC) || 0;


    let code = `setPlateVelocity({plate: 1, speed: ${value_speed_1}, direction: ${value_direction_1}});\n`;
    code += `setPlateVelocity({plate: 2, speed: ${value_speed_2}, direction: ${value_direction_2}});\n`;
    code +='runDeformationModel();\n';
    return code;
  };

  Blockly.Blocks['deformation-create-graph'] = {
    init() {
      this.appendDummyInput()
          .appendField(strings.CREATE_DEFORMATION_GRAPH);
      this.setColour("#B35F00");
      this.setPreviousStatement(false, null);
      this.setNextStatement(true, null);
    }
  };

  Blockly.JavaScript['deformation-create-graph'] = function(block) {
    return `createDeformationGraph();`;
  };


  Blockly.Blocks['deformation-model-step'] = {
    init() {
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
      this.setColour("#B35F00");
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['deformation-model-step'] = function(block) {
    const value_speed1 = Blockly.JavaScript.valueToCode(block, 'speed1', Blockly.JavaScript.ORDER_ATOMIC) || 0;

    const value_speed2 = Blockly.JavaScript.valueToCode(block, 'speed2', Blockly.JavaScript.ORDER_ATOMIC) || 0;

    const code = `
      stepDeformationModel({year: year, plate_1_speed: ${value_speed1}, plate_2_speed: ${value_speed2}});
  `;
  return code;
  };

  Blockly.Blocks['deformation-model-earthquake'] = {
    init() {
      this.appendDummyInput()
          .appendField(strings.TRIGGER_EARTHQUAKE);
      this.appendDummyInput()
          .appendField(strings.SET_DEFORMATION);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#B35F00");
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['deformation-model-earthquake'] = function(block) {
    const code = `
      triggerEarthquake();
  `;
  return code;
  };

  Blockly.Blocks['deformation-model-get-deformation'] = {
    init() {
      this.appendDummyInput()
          .appendField(strings.DEFORMATION);
      this.setOutput(true, 'Number');
      this.setColour("#B35F00");
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['deformation-model-get-deformation'] = function(block) {
    const code = `getDeformation()`;
  return [code, Blockly.JavaScript.ORDER_NONE];
  };


  Blockly.Blocks['deformation-model-get-max-deformation'] = {
    init() {
      this.appendDummyInput()
          .appendField(strings.MAX_DEFORMATION);
      this.appendDummyInput()
          .appendField(strings.BASED_ON)
          .appendField(new Blockly.FieldDropdown([["low", "low"], ["medium", "medium"], ["high", "high"]]), strings.FRICTION)
          .appendField(strings.FRICTION);
      this.setOutput(true, 'Number');
      this.setColour("#B35F00");
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['deformation-model-get-max-deformation'] = function(block) {
    const friction = block.getFieldValue('friction');
    const code = `getMaxDeformation("${friction}")`;
  return [code, Blockly.JavaScript.ORDER_NONE];
  };

  Blockly.Blocks['deformation-plot-data'] = {
    init() {
      this.appendDummyInput()
          .appendField(strings.PLOT_DEFORMATION);
      this.setColour("#B35F00");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
    }
  };

  Blockly.JavaScript['deformation-plot-data'] = function(block) {
    return 'plotDeformationData();';
  };

  Blockly.Blocks['deformation-boundary-orientation'] = {
    init () {
      this.appendValueInput('orientation')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.SET_BOUNDARY)
        .setCheck(['Number']);
      this.setColour("#B35F00");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
    }
  };

  Blockly.JavaScript['deformation-boundary-orientation'] = function(plate) {
    const value_orientation = Blockly.JavaScript.valueToCode(plate, 'orientation', Blockly.JavaScript.ORDER_ATOMIC) || 0;

    const code = `setBoundaryOrientation(${value_orientation});\n`;
    return code;
  };
