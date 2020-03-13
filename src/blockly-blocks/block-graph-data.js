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
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Graph excedence for");
    this.appendDummyInput()
        .appendField("samples from")
        .appendField(new Blockly.FieldDropdown(this.generateOptions), "locations");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("exceeding")
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
  var location = block.getFieldValue('locations')
  var threshold = block.getFieldValue('threshold');

  var code = `graphExceedance({location: "${location}", threshold: ${threshold}});\n`
  return code
}