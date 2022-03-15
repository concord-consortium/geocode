import * as strings from "../../strings/blockly-blocks/wind-data/wind-data"

Blockly.Blocks['graph_speed_date_wind_data'] = {
  init: function () {
    this.appendValueInput('wind data')
      .setCheck('Dataset')
      .appendField(strings.GRAPH_WIND_DATA)
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour("#B35F00")
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
      .appendField(strings.GRAPH_WIND_SPEED)
    this.appendDummyInput()
      .appendField(strings.AND_DIRECTION)
    this.appendValueInput('wind data')
      .setCheck('Dataset')
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour("#B35F00")
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
    this.setColour("#B35F00")
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
