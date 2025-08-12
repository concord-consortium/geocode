import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";

Blockly.Blocks.lat_long = {
  init() {
    this.appendDummyInput()
      .appendField("Latitude, Longitude")
      .appendField(new Blockly.FieldTextInput(""), "lat_long");
    this.setOutput(true, 'lat_long');
    this.setColour("#006f95");
    this.setTooltip('');
    this.setHelpUrl('');
  }
};

const failCode = [`({lat: null, long: null})`, javascriptGenerator.ORDER_NONE];

javascriptGenerator.forBlock.lat_long = function (block) {
  const lat_long = block.getFieldValue('lat_long');

  try {
    const [lat, long] = lat_long.split(",").map(str => str.trim()).map(Number);

    if (isNaN(lat) || isNaN(long)) {
      block.setWarningText("Latitude and longitude values must be numbers");
      return failCode;
    }

    // have to wrap in parens or the parser doesn't like it as a fragment
    const code = `({lat: ${lat}, long: ${long}})`;
    block.setWarningText(null);
    return [code, javascriptGenerator.ORDER_ATOMIC];
  } catch {
    block.setWarningText("Error parsing latitude and longitude input");
    return failCode;
  }
};
