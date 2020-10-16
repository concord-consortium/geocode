Blockly.Blocks['seismic_all_gps_stations'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('All GPS Stations')
    this.setOutput(true, 'GPS_Station')
    this.setColour("%{BKY_LISTS_HUE}")
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_all_gps_stations'] = function (block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'getAllGPSStations()'
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE]
}

Blockly.Blocks['seismic_show_gps_stations'] = {
  init: function () {
    this.appendValueInput('stations')
      .setCheck(['GPS_Station', 'String'])
      .appendField('Show GPS Stations')
    this.appendDummyInput()
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Show station velocities')
      .appendField(new Blockly.FieldCheckbox(true), 'velocities')
    this.setInputsInline(false)
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(230)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_show_gps_stations'] = function (block) {
  var value_stations = Blockly.JavaScript.valueToCode(block, 'stations', Blockly.JavaScript.ORDER_ATOMIC)
  var value_velocities = block.getFieldValue('velocities') === "TRUE";

  var code = `showGPSStations(${value_stations});\nshowGPSStationVelocities(${value_velocities});\n`
  return code
}

Blockly.Blocks['seismic_sample_data'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('sample')
      .appendField(new Blockly.FieldTextInput('10'), 'sample_size')
      .appendField('items')
    this.appendValueInput('count')
      .setCheck('GPS_Station')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('from')
    this.setOutput(true, 'GPS_Station')
    this.setColour("%{BKY_LISTS_HUE}")
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_sample_data'] = function (block) {
  var sampleSize = block.getFieldValue('sample_size');
  var dataset = Blockly.JavaScript.valueToCode(block, 'count', Blockly.JavaScript.ORDER_ATOMIC) || "null";
  // TODO: Assemble JavaScript into code variable.
  var code = `sampleDataset({dataset: ${dataset}, sampleSize: ${sampleSize}})`
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE]
};

Blockly.Blocks['seismic_filter_data'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Filter')
    this.appendValueInput('source')
      .setCheck('GPS_Station')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Select from')
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
    this.appendValueInput('min_speed')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Min Speed (mm/y)')
    this.appendValueInput('max_speed')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Max Speed (mm/y)')
    this.appendValueInput('min_dir')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Min Direction (º)')
    this.appendValueInput('max_dir')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Max Direction (º)')
    this.setInputsInline(false)
    this.setOutput(true, 'GPS_Station')
    this.setColour("%{BKY_LISTS_HUE}")
    this.setTooltip('Filter Data')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_filter_data'] = function (block) {

  function num(n) {
    // Blockly adds parentheses around negatives, so we have to strip them first
    return parseFloat(n.replace(/[\(\)]/g, ""));
  }
  var dataset = Blockly.JavaScript.valueToCode(block, 'source', Blockly.JavaScript.ORDER_ATOMIC) || "null";
  var value_lat_1 = num(Blockly.JavaScript.valueToCode(block, 'lat_1', Blockly.JavaScript.ORDER_ATOMIC))
  var value_lng_1 = num(Blockly.JavaScript.valueToCode(block, 'lng_1', Blockly.JavaScript.ORDER_ATOMIC))
  var value_lat_2 = num(Blockly.JavaScript.valueToCode(block, 'lat_2', Blockly.JavaScript.ORDER_ATOMIC))
  var value_lng_2 = num(Blockly.JavaScript.valueToCode(block, 'lng_2', Blockly.JavaScript.ORDER_ATOMIC))
  var value_min_speed = num(Blockly.JavaScript.valueToCode(block, 'min_speed', Blockly.JavaScript.ORDER_ATOMIC))
  var value_max_speed = num(Blockly.JavaScript.valueToCode(block, 'max_speed', Blockly.JavaScript.ORDER_ATOMIC))
  var value_min_dir = num(Blockly.JavaScript.valueToCode(block, 'min_dir', Blockly.JavaScript.ORDER_ATOMIC))
  var value_max_dir = num(Blockly.JavaScript.valueToCode(block, 'max_dir', Blockly.JavaScript.ORDER_ATOMIC))

  var filter = {
    latitude: {
      min: Math.min(value_lat_1, value_lat_2) || "DEFAULT",
      max: Math.max(value_lat_1, value_lat_2) || "DEFAULT"
    },
    longitude: {
      min: Math.min(value_lng_1, value_lng_2) || "DEFAULT",
      max: Math.max(value_lng_1, value_lng_2) || "DEFAULT"
    },
    speed: {min: value_min_speed || 0, max: value_max_speed || 100},
    direction: {min: value_min_dir || 0, max: value_max_dir || 360}
  };

  // remove all defaults by hand if both min and max are defaults. For lat and lng we won't ever have just one value
  if (filter.latitude.min === "DEFAULT" && filter.latitude.max === "DEFAULT") delete filter.latitude;
  if (filter.longitude.min === "DEFAULT" && filter.longitude.max === "DEFAULT") delete filter.longitude;
  if (filter.speed.min === 0 && filter.speed.max === 100) delete filter.speed;
  if (filter.direction.min === 0 && filter.direction.max === 360) delete filter.direction;

  // if use only enters only one corner for either lat or lng, insert "ERROR" so interpreter will know to throw error
  if ((isNaN(value_lat_1) && !isNaN(value_lat_2)) || (!isNaN(value_lat_1) && isNaN(value_lat_2))) {
    filter.latitude = "ERROR";
  }
  if ((isNaN(value_lng_1) && !isNaN(value_lng_2)) || (!isNaN(value_lng_1) && isNaN(value_lng_2))) {
    filter.longitude = "ERROR";
  }

  let filterObj = JSON.stringify(filter);
  filterObj = filterObj.replace(/"([^"]+)":/g, '$1:')

  var code = `filter({dataset: ${dataset}, filter: ${filterObj}})`
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE]
}
