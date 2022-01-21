Blockly.Blocks['seismic_compute_strain'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Compute deformation build-up')
    this.appendValueInput('stations')
      .setAlign(Blockly.ALIGN_RIGHT)
      .setCheck(['GPS_Station', 'String'])
      .appendField('Show GPS Stations')
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour("#EB0000")
    this.setTooltip('Compute strain rate')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_compute_strain'] = function (block) {
  var value_stations = Blockly.JavaScript.valueToCode(block, 'stations', Blockly.JavaScript.ORDER_ATOMIC)
  var value_velocities = block.getFieldValue('velocities') === "TRUE";

  var code = `computeStrainRate(${value_stations});`
  // TODO: Change ORDER_NONE to the correct strength.
  return code;
}

Blockly.Blocks['seismic_logarithmic'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Logarithmic')
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
      .appendField('Equal Interval')
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

Blockly.Blocks['seismic_render_strain_triangles'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Color the map by deformation build-up')
    this.setInputsInline(false)

    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour("#EB0000")
    this.setTooltip('Color the map by deformation build-up')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_render_strain_triangles'] = function (block) {

  return  "renderStrainRate();";
}

Blockly.Blocks['seismic_render_strain_labels'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Show strain rate value')
    this.setInputsInline(false)
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour("#EB0000")
    this.setTooltip('Show strain rate value')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_render_strain_labels'] = function (block) {
  var code = "renderStrainRateLabels();";
  return code;
}
