Blockly.Blocks['graph_gps_position'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Graph GPS location over time')
    this.appendDummyInput()
      .appendField('Station')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(new Blockly.FieldDropdown([
          ["HARV", "HARV"],
          ["P513", "P513"],
          ["FGST", "FGST"],
          ["P519", "P519"],
          ["P518", "P518"],
          ["P521", "P521"],
          ["P535", "P535"],
          ["P537", "P537"],
          ["CRGG", "CRGG"],
          ["P522", "P522"],
          ["P541", "P541"],
          ["P543", "P543"],
          ["BVPP", "BVPP"],
          ["P544", "P544"],
          ["P563", "P563"],
          ["P558", "P558"],
          ["P565", "P565"],
          ["P567", "P567"],
          ["P570", "P570"],
          ["P571", "P571"],
          ["P573", "P573"],
          ["P093", "P093"],
          ["P094", "P094"],
          ["P092", "P092"],
          ["CRAM", "CRAM"],
      ]), 'station');
    this.appendValueInput('from')
      .setCheck(['String'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Start')
    this.appendValueInput('to')
      .setCheck(['String'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('End')
    this.appendValueInput('duration')
      .setCheck(['String', 'Number'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Duration')

    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(230)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['graph_gps_position'] = function (block) {
  var value_station = block.getFieldValue('station');
  var value_from = Blockly.JavaScript.valueToCode(block, 'from', Blockly.JavaScript.ORDER_ATOMIC).replace(/\'/g, "") || "";
  var value_to = Blockly.JavaScript.valueToCode(block, 'to', Blockly.JavaScript.ORDER_ATOMIC).replace(/\'/g, "") || "";
  var raw_duration = Blockly.JavaScript.valueToCode(block, 'duration', Blockly.JavaScript.ORDER_ATOMIC);
  if (typeof raw_duration === "string") {
    raw_duration = parseInt(raw_duration.replace(/\'/g, ""));
  }
  var value_duration = raw_duration || 0;

  var timeRange = {};

  if (value_from) timeRange.from = value_from;
  if (value_to) timeRange.to = value_to;
  if (value_duration) timeRange.duration = value_duration;

  let timeRangeStr = JSON.stringify(timeRange);

  var code =
  `graphGPSPositions({
    station: "${value_station}",
    timeRange: ${timeRangeStr}
  });\n`;

  return code
}