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
    this.appendValueInput('wind data')
      .setCheck('Dataset')
      .appendField('Graph Wind Speed and Direction')
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
    this.appendValueInput('wind data')
      .setCheck('Dataset')
      .appendField('Graph Wind Data')
      .appendField(new Blockly.FieldDropdown([
          ['speed', 'speed'],
      ]), 'yAxis')
      .appendField('against')
      .appendField(new Blockly.FieldDropdown([
          ['date', 'date'],
          ['day of year', 'dayOfYear'],
          ['month', 'month'],
          ['year', 'year'],
          ['hour', 'hour'],
          ['elevation', 'elevation'],
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