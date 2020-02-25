Blockly.Blocks['all_wind_data'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('All Wind Data')
    this.setOutput(true, 'Dataset')
    this.setColour(230)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['all_wind_data'] = function (block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'getAllWindData()'
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE]
}