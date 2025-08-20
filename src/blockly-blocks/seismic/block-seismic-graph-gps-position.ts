import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import * as strings from '../../strings/blockly-blocks/seismic/seismic-graph';
import {positionStationNames} from '../../assets/data/seismic/position-time-data';

const stationOptions: [string, string][] = positionStationNames.sort().map(station => [station, station]);
const { RIGHT } = Blockly.inputs.Align;

Blockly.Blocks.graph_gps_position = {
  init () {
    this.appendDummyInput()
      .appendField(strings.GRAPH_GPS);
    this.appendDummyInput()
      .appendField(strings.STATION)
      .setAlign(RIGHT)
      .appendField(new Blockly.FieldDropdown(stationOptions), 'station');
    this.appendValueInput('from')
      .setCheck(['String', 'Number'])
      .setAlign(RIGHT)
      .appendField(strings.START_DATE);
    this.appendValueInput('to')
      .setCheck(['String', 'Number'])
      .setAlign(RIGHT)
      .appendField(strings.END_DATE);
    this.appendValueInput('duration')
      .setCheck(['String', 'Number'])
      .setAlign(RIGHT)
      .appendField(strings.DURATION);

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#EB0000");
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
javascriptGenerator.forBlock.graph_gps_position = function (block) {
  const value_station = block.getFieldValue('station');
  let value_from = javascriptGenerator.valueToCode(block, 'from', Order.ATOMIC) || "";
  let value_to = javascriptGenerator.valueToCode(block, 'to', Order.ATOMIC) || "";
  let raw_duration: number | string = javascriptGenerator.valueToCode(block, 'duration', Order.ATOMIC);

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

  const timeRange = {
    from: value_from || undefined,
    to: value_to || undefined,
    duration: value_duration || undefined
  };

  const timeRangeStr = JSON.stringify(timeRange);

  const code =
  `graphGPSPositions({
    station: "${value_station}",
    timeRange: ${timeRangeStr}
  });\n`;

  return code;
};
