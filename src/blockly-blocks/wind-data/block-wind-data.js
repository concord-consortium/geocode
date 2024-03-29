import * as strings from "../../strings/blockly-blocks/wind-data/wind-data"

Blockly.Blocks['all_wind_data'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(strings.ALL_WIND_DATA)
    this.setOutput(true, 'Dataset')
    this.setColour("#B35F00")
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

Blockly.Blocks['sample_data'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(strings.SAMPLE)
      .appendField(new Blockly.FieldTextInput('10'), 'sample_size')
      .appendField(strings.ITEMS)
    this.appendValueInput('count')
      .setCheck('Dataset')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(strings.FROM)
    this.setOutput(true, 'Dataset')
    this.setColour("#B35F00")
    this.setTooltip('')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['sample_data'] = function (block) {
  var sampleSize = block.getFieldValue('sample_size');
  var dataset = Blockly.JavaScript.valueToCode(block, 'count', Blockly.JavaScript.ORDER_ATOMIC) || "null";
  // TODO: Assemble JavaScript into code variable.
  var code = `sampleDataset({dataset: ${dataset}, sampleSize: ${sampleSize}})`
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE]
};

Blockly.Blocks['filter_data'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(strings.FILTER)
    this.appendValueInput('source')
      .setCheck('Dataset')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Select from')
    this.appendValueInput('day')
      .setCheck(['Number', 'range'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Day')
    this.appendValueInput('month')
      .setCheck(['Number', 'range'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Month')
    this.appendValueInput('year')
      .setCheck(['Number', 'range'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Year')
    this.appendValueInput('direction')
      .setCheck(['Number', 'range'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Direction (º from North)')
    this.appendValueInput('speed')
      .setCheck(['Number', 'range'])
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Speed (m/s)')
    this.setInputsInline(false)
    this.setOutput(true, 'Dataset')
    this.setColour("#B35F00")
    this.setTooltip('Filter Data')
    this.setHelpUrl('')
  }
}
Blockly.JavaScript['filter_data'] = function (block) {
  var dataset = Blockly.JavaScript.valueToCode(block, 'source', Blockly.JavaScript.ORDER_ATOMIC) || "null";
  var value_day = Blockly.JavaScript.valueToCode(block, 'day', Blockly.JavaScript.ORDER_ATOMIC)
  var value_month = Blockly.JavaScript.valueToCode(block, 'month', Blockly.JavaScript.ORDER_ATOMIC)
  var value_year = Blockly.JavaScript.valueToCode(block, 'year', Blockly.JavaScript.ORDER_ATOMIC)
  var value_direction = Blockly.JavaScript.valueToCode(block, 'direction', Blockly.JavaScript.ORDER_ATOMIC)
  var value_speed = Blockly.JavaScript.valueToCode(block, 'speed', Blockly.JavaScript.ORDER_ATOMIC)

  var filter = {
    day: value_day,
    month: value_month,
    year: value_year,
    direction: value_direction,
    speed: value_speed
  };
  const allKeys = Object.keys(filter);
  allKeys.forEach((key) => {
    if (filter[key] === "") {
      delete filter[key];
    }
  });
  let filterObj = JSON.stringify(filter);
  filterObj = filterObj.replace(/\"/g, "");
  var code = `filter({dataset: ${dataset}, filter: ${filterObj}})`
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE]
}