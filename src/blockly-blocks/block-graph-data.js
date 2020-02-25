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
  // TODO: Assemble JavaScript into code variable.
  var code = `graphSpeedDateScatterPlot(${value_wind_data});\n`
  return code
}