Blockly.Blocks['seismic_compute_strain'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Compute strain rate')
    this.appendValueInput('lat_1')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Corner 1 Lat')
    this.appendValueInput('lng_1')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Corner 1 Long')
    this.appendValueInput('lat_2')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Corner 2 Lat')
    this.appendValueInput('lng_2')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Corner 2 Long')
    this.setInputsInline(false)

    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(230)
    this.setTooltip('Compute strain rate')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_compute_strain'] = function (block) {
  function num(n) {
    // Blockly adds parentheses around negatives, so we have to strip them first
    return parseFloat(n.replace(/[\(\)]/g, ""));
  }
  var value_lat_1 = num(Blockly.JavaScript.valueToCode(block, 'lat_1', Blockly.JavaScript.ORDER_ATOMIC))
  var value_lng_1 = num(Blockly.JavaScript.valueToCode(block, 'lng_1', Blockly.JavaScript.ORDER_ATOMIC))
  var value_lat_2 = num(Blockly.JavaScript.valueToCode(block, 'lat_2', Blockly.JavaScript.ORDER_ATOMIC))
  var value_lng_2 = num(Blockly.JavaScript.valueToCode(block, 'lng_2', Blockly.JavaScript.ORDER_ATOMIC))

  var filter = {
    latitude: {
      min: Math.min(value_lat_1, value_lat_2) || "DEFAULT",
      max: Math.max(value_lat_1, value_lat_2) || "DEFAULT"
    },
    longitude: {
      min: Math.min(value_lng_1, value_lng_2) || "DEFAULT",
      max: Math.max(value_lng_1, value_lng_2) || "DEFAULT"
    }
  };

  // remove all defaults by hand if both min and max are defaults. For lat and lng we won't ever have just one value
  if (filter.latitude.min === "DEFAULT" && filter.latitude.max === "DEFAULT") delete filter.latitude;
  if (filter.longitude.min === "DEFAULT" && filter.longitude.max === "DEFAULT") delete filter.longitude;

  // if use only enters only one corner for either lat or lng, insert "ERROR" so interpreter will know to throw error
  if ((isNaN(value_lat_1) && !isNaN(value_lat_2)) || (!isNaN(value_lat_1) && isNaN(value_lat_2))) {
    filter.latitude = "ERROR";
  }
  if ((isNaN(value_lng_1) && !isNaN(value_lng_2)) || (!isNaN(value_lng_1) && isNaN(value_lng_2))) {
    filter.longitude = "ERROR";
  }

  let filterObj = JSON.stringify(filter);
  filterObj = filterObj.replace(/"([^"]+)":/g, '$1:');

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
