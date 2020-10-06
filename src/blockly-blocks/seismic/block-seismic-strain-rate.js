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
