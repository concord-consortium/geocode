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
    this.appendValueInput('min_long')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Min Longitude')
    this.appendValueInput('max_long')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Max Longitude')
    this.appendValueInput('min_lat')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Min Latitude')
    this.appendValueInput('max_lat')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Max Latitude')
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
  var dataset = Blockly.JavaScript.valueToCode(block, 'source', Blockly.JavaScript.ORDER_ATOMIC) || "null";
  var value_min_long = Blockly.JavaScript.valueToCode(block, 'min_long', Blockly.JavaScript.ORDER_ATOMIC)
  var value_max_long = Blockly.JavaScript.valueToCode(block, 'max_long', Blockly.JavaScript.ORDER_ATOMIC)
  var value_min_lat = Blockly.JavaScript.valueToCode(block, 'min_lat', Blockly.JavaScript.ORDER_ATOMIC)
  var value_max_lat = Blockly.JavaScript.valueToCode(block, 'max_lat', Blockly.JavaScript.ORDER_ATOMIC)
  var value_min_speed = Blockly.JavaScript.valueToCode(block, 'min_speed', Blockly.JavaScript.ORDER_ATOMIC)
  var value_max_speed = Blockly.JavaScript.valueToCode(block, 'max_speed', Blockly.JavaScript.ORDER_ATOMIC)
  var value_min_dir = Blockly.JavaScript.valueToCode(block, 'min_dir', Blockly.JavaScript.ORDER_ATOMIC)
  var value_max_dir = Blockly.JavaScript.valueToCode(block, 'max_dir', Blockly.JavaScript.ORDER_ATOMIC)

  var filter = {
    longitude: {min: value_min_long || -180, max: value_max_long || 180},
    latitude: {min: value_min_lat || -90, max: value_max_lat || 90},
    speed: {min: value_min_speed || 0, max: value_max_speed || 500},
    direction: {min: value_min_dir || 0, max: value_max_dir || 360}
  };

  // remove all defaults by hand if both min and max are defaults
  if (filter.longitude.min === -180 && filter.longitude.max === 180) delete filter.longitude;
  if (filter.latitude.min === -90 && filter.latitude.max === 90) delete filter.latitude;
  if (filter.speed.min === 0 && filter.speed.max === 500) delete filter.speed;
  if (filter.direction.min === 0 && filter.direction.max === 360) delete filter.direction;

  let filterObj = JSON.stringify(filter);
  filterObj = filterObj.replace(/\"/g, "");

  var code = `filter({dataset: ${dataset}, filter: ${filterObj}})`
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE]
}
