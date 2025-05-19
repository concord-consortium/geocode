// import { RANGE_FROM } from "../strings/blockly-blocks/all-other-blocks";

Blockly.Blocks.lat_long = {
  init() {
    this.appendDummyInput()
      .appendField("Latitude, Longitude")
      .appendField(new Blockly.FieldString(), 'lat_long');
    // this.appendDummyInput()
    //   .appendField(RANGE_FROM)
    //   .appendField(new Blockly.FieldNumber(0), 'min')
    //   .appendField('to')
    //   .appendField(new Blockly.FieldNumber(10), 'max');
    // this.setOutput(true, 'range');
    this.setColour("#006f95");
    this.setTooltip('');
    this.setHelpUrl('');
  }
};
Blockly.JavaScript.lat_long = function (block) {
  const lat_long = block.getFieldValue('lat_long');
  // const number_min = block.getFieldValue('min');
  // const number_max = block.getFieldValue('max');

  const [lat, long] = lat_long.split(",").map(str => str.trim()).map(Number);
  return `({lat: ${lat}, long: ${long}})`;
  // have to wrap in parens or the parser doesn't like it as a fragment
  // const code = `({min: ${number_min}, max: ${number_max}})`;
  // // TODO: Change ORDER_NONE to the correct strength.
  // return [code, Blockly.JavaScript.ORDER_NONE];
};
