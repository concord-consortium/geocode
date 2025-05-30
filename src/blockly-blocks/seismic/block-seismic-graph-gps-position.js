import * as strings from '../../strings/blockly-blocks/seismic/seismic-graph';
import {positionStationNames} from '../../assets/data/seismic/position-time-data';

const stationOptions = positionStationNames.sort().map(station => [station, station]);

Blockly.Blocks.graph_gps_position = {
  init () {
    this.appendDummyInput()
      .appendField(strings.GRAPH_GPS);
    this.appendDummyInput()
      .appendField(strings.STATION)
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(new Blockly.FieldDropdown(stationOptions), 'station');
    this.appendValueInput('from')
      .setCheck(['String', 'Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.START_DATE);
    this.appendValueInput('to')
      .setCheck(['String', 'Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.END_DATE);
    this.appendValueInput('duration')
      .setCheck(['String', 'Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.DURATION);

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#EB0000");
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.JavaScript.graph_gps_position = function (block) {
  const value_station = block.getFieldValue('station');
  let value_from = Blockly.JavaScript.valueToCode(block, 'from', Blockly.JavaScript.ORDER_ATOMIC) || "";
  let value_to = Blockly.JavaScript.valueToCode(block, 'to', Blockly.JavaScript.ORDER_ATOMIC) || "";
  let raw_duration = Blockly.JavaScript.valueToCode(block, 'duration', Blockly.JavaScript.ORDER_ATOMIC);

  if (typeof value_from === "number") {
    value_from = "" + value_from;
  }
  if (typeof value_to === "number") {
    value_to = "" + value_to;
  }
  if (typeof raw_duration === "string") {
    raw_duration = parseInt(raw_duration.replace(/\'/g, ""), 10);
  }
  const value_duration = raw_duration || 0;

  const timeRange = {};

  if (value_from) timeRange.from = value_from;
  if (value_to) timeRange.to = value_to;
  if (value_duration) timeRange.duration = value_duration;

  const timeRangeStr = JSON.stringify(timeRange);

  const code =
  `graphGPSPositions({
    station: "${value_station}",
    timeRange: ${timeRangeStr}
  });\n`;

  return code;
};
