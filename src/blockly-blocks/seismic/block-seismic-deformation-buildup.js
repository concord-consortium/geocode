import * as strings from '../../strings/blockly-blocks/seismic/seismic-deformation'

Blockly.Blocks['seismic_compute_deformation'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(strings.COMPUTE_DEFORMATION_BUILDUP)
    this.appendValueInput('stations')
      .setAlign(Blockly.ALIGN_RIGHT)
      .setCheck(['GPS_Station', 'String'])
      .appendField(strings.SHOW_STATIONS)
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour("#EB0000")
    this.setTooltip('Compute deformation rate')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_compute_deformation'] = function (block) {
  var value_stations = Blockly.JavaScript.valueToCode(block, 'stations', Blockly.JavaScript.ORDER_ATOMIC)
  var value_velocities = block.getFieldValue('velocities') === "TRUE";

  var code = `computeDeformationBuildup(${value_stations});`
  // TODO: Change ORDER_NONE to the correct strength.
  return code;
}

Blockly.Blocks['seismic_logarithmic'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(strings.LOGARITHMIC)
    this.setOutput(true, 'Color_method')
    this.setColour("#EB0000")
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_logarithmic'] = function (block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '"logarithmic"';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE]
}

Blockly.Blocks['seismic_equal_interval'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(strings.EQUAL_INTERVAL)
    this.setOutput(true, 'Color_method')
    this.setColour("#EB0000")
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_equal_interval'] = function (block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '"equalInterval"';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE]
}

Blockly.Blocks['seismic_render_deformation_triangles'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(strings.COLOR_MAP)
    this.setInputsInline(false)

    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour("#EB0000")
    this.setTooltip(strings.COLOR_MAP)
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_render_deformation_triangles'] = function (block) {

  return  "renderDeformationBuildup();";
}

Blockly.Blocks['seismic_render_deformation_labels'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(strings.SHOW_DEFORMATION)
    this.setInputsInline(false)
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour("#EB0000")
    this.setTooltip(strings.SHOW_DEFORMATION)
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_render_deformation_labels'] = function (block) {
  var code = "renderDeformationBuildupLabels();";
  return code;
}
