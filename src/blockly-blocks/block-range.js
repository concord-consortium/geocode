Blockly.Blocks['input_range'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('range from')
      .appendField(new Blockly.FieldNumber(0), 'min')
      .appendField('to')
      .appendField(new Blockly.FieldNumber(0), 'max')
    this.setOutput(true, 'range')
    this.setColour(230)
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['input_range'] = function (block) {
  var number_min = block.getFieldValue('min')
  var number_max = block.getFieldValue('max')

  // have to wrap in parens or the parser doesn't like it as a fragment
  var code = `({min: ${number_min}, max: ${number_max}})`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE]
}