import * as strings from '../../strings/blockly-blocks/seismic/seismic-gps-stations';

Blockly.Blocks.seismic_all_gps_stations = {
  init () {
    this.appendDummyInput()
      .appendField(strings.ALL_STATIONS);
    this.setOutput(true, 'GPS_Station');
    this.setColour("#EB0000");
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.JavaScript.seismic_all_gps_stations = function (block) {
  // TODO: Assemble JavaScript into code variable.
  const code = 'getAllGPSStations()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks.seismic_show_gps_stations = {
  init () {
    this.appendValueInput('stations')
      .setCheck(['GPS_Station', 'String'])
      .appendField(strings.SHOW_GPS_STATIONS);
    this.appendDummyInput()
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.SHOW_VELOCITIES)
      .appendField(new Blockly.FieldCheckbox(true), 'velocities');
    this.setInputsInline(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#EB0000");
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.JavaScript.seismic_show_gps_stations = function (block) {
  const value_stations = Blockly.JavaScript.valueToCode(block, 'stations', Blockly.JavaScript.ORDER_ATOMIC);
  const value_velocities = block.getFieldValue('velocities') === "TRUE";

  const code = `showGPSStations(${value_stations});\nshowGPSStationVelocities(${value_velocities});\n`;
  return code;
};

Blockly.Blocks.seismic_sample_data = {
  init () {
    this.appendDummyInput()
      .appendField(strings.SAMPLE)
      .appendField(new Blockly.FieldTextInput('10'), 'sample_size')
      .appendField(strings.ITEMS);
    this.appendValueInput('count')
      .setCheck('GPS_Station')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.FROM);
    this.setOutput(true, 'GPS_Station');
    this.setColour("#EB0000");
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.JavaScript.seismic_sample_data = function (block) {
  const sampleSize = block.getFieldValue('sample_size');
  const dataset = Blockly.JavaScript.valueToCode(block, 'count', Blockly.JavaScript.ORDER_ATOMIC) || "null";
  // TODO: Assemble JavaScript into code variable.
  const code = `sampleDataset({dataset: ${dataset}, sampleSize: ${sampleSize}})`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks.seismic_filter_data = {
  init () {
    this.appendDummyInput()
      .appendField(strings.FILTER);
    this.appendValueInput('source')
      .setCheck('GPS_Station')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.SELECT_FROM);
    this.appendValueInput('lat_1')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.CORNER_1_LAT);
    this.appendValueInput('lng_1')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.CORNER_1_LONG);
    this.appendValueInput('lat_2')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.CORNER_2_LAT);
    this.appendValueInput('lng_2')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.CORNER_2_LONG);
    this.appendValueInput('min_speed')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.MIN_SPEED);
    this.appendValueInput('max_speed')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.MAX_SPEED);
    this.appendValueInput('min_dir')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.MIN_DIRECTION);
    this.appendValueInput('max_dir')
      .setCheck(['Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.MAX_DIRECTION);
    this.appendDummyInput()
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.STATIONS_HISTORICAL)
      .appendField(new Blockly.FieldCheckbox(false), 'position_history');
    this.setInputsInline(false);
    this.setOutput(true, 'GPS_Station');
    this.setColour("#EB0000");
    this.setTooltip(strings.FILTER_DATA);
    this.setHelpUrl('');
  }
};
Blockly.JavaScript.seismic_filter_data = function (block) {

  function num(n) {
    // Blockly adds parentheses around negatives, so we have to strip them first
    return parseFloat(n.replace(/[\(\)]/g, ""));
  }
  const dataset = Blockly.JavaScript.valueToCode(block, 'source', Blockly.JavaScript.ORDER_ATOMIC) || "null";
  const value_lat_1 = num(Blockly.JavaScript.valueToCode(block, 'lat_1', Blockly.JavaScript.ORDER_ATOMIC));
  const value_lng_1 = num(Blockly.JavaScript.valueToCode(block, 'lng_1', Blockly.JavaScript.ORDER_ATOMIC));
  const value_lat_2 = num(Blockly.JavaScript.valueToCode(block, 'lat_2', Blockly.JavaScript.ORDER_ATOMIC));
  const value_lng_2 = num(Blockly.JavaScript.valueToCode(block, 'lng_2', Blockly.JavaScript.ORDER_ATOMIC));
  const value_min_speed = num(Blockly.JavaScript.valueToCode(block, 'min_speed', Blockly.JavaScript.ORDER_ATOMIC));
  const value_max_speed = num(Blockly.JavaScript.valueToCode(block, 'max_speed', Blockly.JavaScript.ORDER_ATOMIC));
  const value_min_dir = num(Blockly.JavaScript.valueToCode(block, 'min_dir', Blockly.JavaScript.ORDER_ATOMIC));
  const value_max_dir = num(Blockly.JavaScript.valueToCode(block, 'max_dir', Blockly.JavaScript.ORDER_ATOMIC));
  const value_position_history = block.getFieldValue('position_history') === "TRUE";

  const filter = {
    latitude: {
      min: Math.min(value_lat_1, value_lat_2) || "DEFAULT",
      max: Math.max(value_lat_1, value_lat_2) || "DEFAULT"
    },
    longitude: {
      min: Math.min(value_lng_1, value_lng_2) || "DEFAULT",
      max: Math.max(value_lng_1, value_lng_2) || "DEFAULT"
    },
    speed: {min: value_min_speed || 0, max: value_max_speed || 100},
    direction: {min: value_min_dir || 0, max: value_max_dir || 360},
    only_stations_with_position_history: value_position_history,
  };

  // remove all defaults by hand if both min and max are defaults. For lat and lng we won't ever have just one value
  if (filter.latitude.min === "DEFAULT" && filter.latitude.max === "DEFAULT") delete filter.latitude;
  if (filter.longitude.min === "DEFAULT" && filter.longitude.max === "DEFAULT") delete filter.longitude;
  if (filter.speed.min === 0 && filter.speed.max === 100) delete filter.speed;
  if (filter.direction.min === 0 && filter.direction.max === 360) delete filter.direction;
  if (!filter.only_stations_with_position_history) delete filter.only_stations_with_position_history;

  // if use only enters only one corner for either lat or lng, insert "ERROR" so interpreter will know to throw error
  if ((isNaN(value_lat_1) && !isNaN(value_lat_2)) || (!isNaN(value_lat_1) && isNaN(value_lat_2))) {
    filter.latitude = "ERROR";
  }
  if ((isNaN(value_lng_1) && !isNaN(value_lng_2)) || (!isNaN(value_lng_1) && isNaN(value_lng_2))) {
    filter.longitude = "ERROR";
  }

  let filterObj = JSON.stringify(filter);
  filterObj = filterObj.replace(/"([^"]+)":/g, '$1:');

  const code = `filter({dataset: ${dataset}, filter: ${filterObj}, useDirectionTo: ${true}})`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
