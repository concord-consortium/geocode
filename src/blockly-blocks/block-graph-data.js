import * as Blockly from "blockly";

Blockly.Blocks['graph_speed_date_wind_data'] = {
  init: function () {
    this.appendValueInput('wind data')
      .setCheck('Dataset')
      .appendField('Graph Wind Data')
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(230)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['graph_speed_date_wind_data'] = function (block) {
  var value_wind_data = Blockly.JavaScript.valueToCode(block, 'wind data', Blockly.JavaScript.ORDER_ATOMIC)

  var code = `graphSpeedDateScatterPlot(${value_wind_data});\n`
  return code
}

Blockly.Blocks['graph_speed_direction_wind_data'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Graph Wind Speed ')
    this.appendDummyInput()
      .appendField('and Direction')
    this.appendValueInput('wind data')
      .setCheck('Dataset')
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(230)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['graph_speed_direction_wind_data'] = function (block) {
  var value_wind_data = Blockly.JavaScript.valueToCode(block, 'wind data', Blockly.JavaScript.ORDER_ATOMIC)

  var code = `graphSpeedDirectionRadialPlot(${value_wind_data});\n`
  return code
}

Blockly.Blocks['graph_any_wind_data'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Graph Wind Data')
    this.appendValueInput('wind data')
      .setCheck('Dataset')
      .appendField(new Blockly.FieldDropdown([
          ['speed', 'speed'],
          ['direction', 'direction'],
      ]), 'yAxis')
      .appendField('against')
      .appendField(new Blockly.FieldDropdown([
          ['date', 'date'],
          ['time of year', 'timeOfYear'],
          ['month', 'month'],
          ['year', 'year'],
          ['hour', 'hour'],
          ['elevation', 'elevation'],
          ['speed', 'speed'],
          ['direction', 'direction'],
      ]), 'xAxis');
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(230)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['graph_any_wind_data'] = function (block) {
  var value_wind_data = Blockly.JavaScript.valueToCode(block, 'wind data', Blockly.JavaScript.ORDER_ATOMIC) || null
  var value_x_axis = block.getFieldValue('xAxis')
  var value_y_axis = block.getFieldValue('yAxis')

  var code = `graphArbitraryPlot({dataset: ${value_wind_data}, xAxis: "${value_x_axis}", yAxis: "${value_y_axis}"});\n`
  return code
}

Blockly.Blocks['graph_exceedance'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Graph data collection")
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(this.generateOptions), "collections");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("and set threshold to")
        .appendField(new Blockly.FieldNumber(200), "threshold")
        .appendField("mm");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  },

  generateOptions: function() {
    if (Blockly.sampleCollections && Blockly.sampleCollections.length > 0) {
      return Blockly.sampleCollections;
    } else {
      return [["<Create collection>",""]];
    }
  }
}
Blockly.JavaScript['graph_exceedance'] = function (block) {
  var collection = block.getFieldValue('collections')
  var threshold = block.getFieldValue('threshold');

  var code = `graphExceedance({collection: "${collection}", threshold: ${threshold}});\n`
  return code
}