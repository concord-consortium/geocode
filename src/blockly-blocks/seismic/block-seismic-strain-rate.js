Blockly.Blocks['seismic_compute_strain'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Compute strain rate')
    this.appendValueInput('min_lat')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Min Latitude')
    this.appendValueInput('max_lat')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Max Latitude')
    this.appendValueInput('min_long')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Min Longitude')
    this.appendValueInput('max_long')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Max Longitude')
    this.setInputsInline(false)

    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(230)
    this.setTooltip('Compute strain rate')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_compute_strain'] = function (block) {
  var value_min_long = Blockly.JavaScript.valueToCode(block, 'min_long', Blockly.JavaScript.ORDER_ATOMIC)
  var value_max_long = Blockly.JavaScript.valueToCode(block, 'max_long', Blockly.JavaScript.ORDER_ATOMIC)
  var value_min_lat = Blockly.JavaScript.valueToCode(block, 'min_lat', Blockly.JavaScript.ORDER_ATOMIC)
  var value_max_lat = Blockly.JavaScript.valueToCode(block, 'max_lat', Blockly.JavaScript.ORDER_ATOMIC)

  var filter = {
    longitude: {min: value_min_long || -180, max: value_max_long || 180},
    latitude: {min: value_min_lat || -90, max: value_max_lat || 90},
  };

  // remove all defaults by hand if both min and max are defaults
  if (filter.longitude.min === -180 && filter.longitude.max === 180) delete filter.longitude;
  if (filter.latitude.min === -90 && filter.latitude.max === 90) delete filter.latitude;

  let filterObj = JSON.stringify(filter);
  filterObj = filterObj.replace(/\"/g, "");

  var code = `computeStrainRate(${filterObj});`
  // TODO: Change ORDER_NONE to the correct strength.
  return code;
}

Blockly.Blocks['seismic_logarithmic'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Logarithmic')
    this.setOutput(true, 'Color_method')
    this.setColour("%{BKY_LISTS_HUE}")
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
    this.setColour("%{BKY_LISTS_HUE}")
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
      .appendField('Color the map by strain rate')
    this.appendValueInput('color_method')
      .setAlign(Blockly.ALIGN_RIGHT)
      .setCheck(['Color_method'])
      .appendField('Method')
    this.setInputsInline(false)

    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(230)
    this.setTooltip('Color the map by strain rate')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_render_strain_triangles'] = function (block) {
  var value_color_method = Blockly.JavaScript.valueToCode(block, 'color_method', Blockly.JavaScript.ORDER_ATOMIC)
  var code = value_color_method ? `renderStrainRate${value_color_method};` : "renderStrainRate();";
  return code;
}
