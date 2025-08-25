import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import * as strings from "../../strings/blockly-blocks/wind-data/wind-data";

const { RIGHT } = Blockly.inputs.Align;

Blockly.Blocks.all_wind_data = {
  init () {
    this.appendDummyInput()
      .appendField(strings.ALL_WIND_DATA);
    this.setOutput(true, 'Dataset');
    this.setColour("#B35F00");
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
javascriptGenerator.forBlock.all_wind_data = function (block) {
  // TODO: Assemble JavaScript into code variable.
  const code = 'getAllWindData()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Order.NONE];
};

Blockly.Blocks.sample_data = {
  init () {
    this.appendDummyInput()
      .appendField(strings.SAMPLE)
      .appendField(new Blockly.FieldTextInput('10'), 'sample_size')
      .appendField(strings.ITEMS);
    this.appendValueInput('count')
      .setCheck('Dataset')
      .setAlign(RIGHT)
      .appendField(strings.FROM);
    this.setOutput(true, 'Dataset');
    this.setColour("#B35F00");
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
javascriptGenerator.forBlock.sample_data = function (block) {
  const sampleSize = block.getFieldValue('sample_size');
  const dataset = javascriptGenerator.valueToCode(block, 'count', Order.ATOMIC) || "null";
  // TODO: Assemble JavaScript into code variable.
  const code = `sampleDataset({dataset: ${dataset}, sampleSize: ${sampleSize}})`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Order.NONE];
};

Blockly.Blocks.filter_data = {
  init () {
    this.appendDummyInput()
      .appendField(strings.FILTER);
    this.appendValueInput('source')
      .setCheck('Dataset')
      .setAlign(RIGHT)
      .appendField('Select from');
    this.appendValueInput('day')
      .setCheck(['Number', 'range'])
      .setAlign(RIGHT)
      .appendField('Day');
    this.appendValueInput('month')
      .setCheck(['Number', 'range'])
      .setAlign(RIGHT)
      .appendField('Month');
    this.appendValueInput('year')
      .setCheck(['Number', 'range'])
      .setAlign(RIGHT)
      .appendField('Year');
    this.appendValueInput('direction')
      .setCheck(['Number', 'range'])
      .setAlign(RIGHT)
      .appendField('Direction (º from North)');
    this.appendValueInput('speed')
      .setCheck(['Number', 'range'])
      .setAlign(RIGHT)
      .appendField('Speed (m/s)');
    this.setInputsInline(false);
    this.setOutput(true, 'Dataset');
    this.setColour("#B35F00");
    this.setTooltip('Filter Data');
    this.setHelpUrl('');
  }
};
javascriptGenerator.forBlock.filter_data = function (block) {
  const dataset = javascriptGenerator.valueToCode(block, 'source', Order.ATOMIC) || "null";
  const value_day = javascriptGenerator.valueToCode(block, 'day', Order.ATOMIC);
  const value_month = javascriptGenerator.valueToCode(block, 'month', Order.ATOMIC);
  const value_year = javascriptGenerator.valueToCode(block, 'year', Order.ATOMIC);
  const value_direction = javascriptGenerator.valueToCode(block, 'direction', Order.ATOMIC);
  const value_speed = javascriptGenerator.valueToCode(block, 'speed', Order.ATOMIC);

  const filter = {
    day: value_day || undefined,
    month: value_month || undefined,
    year: value_year || undefined,
    direction: value_direction || undefined,
    speed: value_speed || undefined
  };
  let filterObj = JSON.stringify(filter);
  filterObj = filterObj.replace(/\"/g, "");
  const code = `filter({dataset: ${dataset}, filter: ${filterObj}})`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Order.NONE];
};
