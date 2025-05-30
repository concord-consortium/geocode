import * as strings from "../../strings/blockly-blocks/tephra/simulate-wind";

// frst one was misnamed (it doesn't take vei as an input) but is already in authors' data
Blockly.Blocks.simulate_wind_sample_vei = {
  init() {
    this.appendDummyInput()
        .appendField(strings.COMPUTE_TEPHRA);
        this.appendValueInput("wind samples")
        .setCheck("Dataset")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(strings.RANDOM_WIND_SAMPLE);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#EB0000");
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript.simulate_wind_sample_vei = function(block) {
  const dataset = Blockly.JavaScript.valueToCode(block, 'wind samples', Blockly.JavaScript.ORDER_ATOMIC) || "null";

  if (dataset === "null") {
    window.blocklyErrorMessage = "null";
  }

  const code = `
    var windSample = getSingleSample(${dataset});
    this.setWindspeedAndDirection(windSample);
    this.setVEI(4);
    this.erupt();
    this.paintMap();
`;
return code;
};

Blockly.Blocks.simulate_wind_sample_vei_2 = {
  init() {
    this.appendDummyInput()
        .appendField("Compute and visualize tephra with");
    this.appendValueInput("wind samples")
        .setCheck("Dataset")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("a random wind sample from");
    this.appendValueInput("vei")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("VEI");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#EB0000");
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript.simulate_wind_sample_vei_2 = function(block) {
  const dataset = Blockly.JavaScript.valueToCode(block, 'wind samples', Blockly.JavaScript.ORDER_ATOMIC) || "null";
  const value_vei = Blockly.JavaScript.valueToCode(block, 'vei', Blockly.JavaScript.ORDER_ATOMIC);

  if (dataset === "null") {
    window.blocklyErrorMessage = "null";
  }

  const code = `
    var windSample = getSingleSample(${dataset});
    this.setWindspeedAndDirection(windSample);
    this.setVEI(${value_vei});
    this.erupt();
    this.paintMap();
`;
return code;
};
