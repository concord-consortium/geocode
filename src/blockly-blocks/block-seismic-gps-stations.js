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
      .setCheck('GPS_Station')
      .appendField('Show GPS Stations')
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(230)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['seismic_show_gps_stations'] = function (block) {
  var value_stations = Blockly.JavaScript.valueToCode(block, 'stations', Blockly.JavaScript.ORDER_ATOMIC)

  var code = `showGPSStations(${value_stations});\n`
  return code
}
