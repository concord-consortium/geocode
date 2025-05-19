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

const failCode = [`({lat: null, long: null})`, Blockly.JavaScript.ORDER_NONE];

Blockly.JavaScript.lat_long = function (block) {
  const lat_long = block.getFieldValue('lat_long');

  try {
    const [lat, long] = lat_long.split(",").map(str => str.trim()).map(Number);

    // TODO: Handle lat/long ranges
    if (isNaN(lat) || isNaN(long)) {
      console.error("Latitude and longitude values must be numbers");
      return failCode;
    }

    // have to wrap in parens or the parser doesn't like it as a fragment
    const code = `({lat: ${lat}, long: ${long}})`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_NONE];
  } catch (e) {
    console.error("Error parsing lat_long:", e);
    return failCode;
  }
};
