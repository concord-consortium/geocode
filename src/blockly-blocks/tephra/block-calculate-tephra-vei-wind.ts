import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import * as strings from '../../strings/blockly-blocks/tephra/calculate-tephra-vei-wind';
import { blocklyStore } from "../../stores/blockly-store";

const { RIGHT } = Blockly.inputs.Align;

Blockly.Blocks.calculate_tephra_vei_wind = {
  init() {
    this.appendDummyInput()
        .appendField(strings.COMPUTE_TEPHRA);
    this.appendDummyInput()
        .setAlign(RIGHT)
        .appendField(strings.AT_LOCATION)
        .appendField(new Blockly.FieldDropdown(this.generateOptionsLoc), "locations");
    this.appendValueInput("wind samples")
        .setCheck("Dataset")
        .setAlign(RIGHT)
        .appendField(strings.RANDOM_WIND_SAMPLE);
    this.appendValueInput("vei")
        .setCheck("Number")
        .setAlign(RIGHT)
        .appendField(strings.VEI);
    this.appendDummyInput()
        .setAlign(RIGHT)
        .appendField(strings.ADD_TO_COLLECTION)
        .appendField(new Blockly.FieldDropdown(this.generateOptionsCol), "collections");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#EB0000");
    this.setTooltip("");
    this.setHelpUrl("");
  },

  generateOptionsLoc() {
    const { sampleLocations } = blocklyStore;
    if (sampleLocations && sampleLocations.length > 0) {
      return sampleLocations;
    } else {
      return [[strings.CREATE_LOCATION,""]];
    }
  },

  generateOptionsCol() {
    const { sampleCollections } = blocklyStore;
    if (sampleCollections && sampleCollections.length > 0) {
      return sampleCollections;
    } else {
      return [[strings.CREATE_LOCATION,""]];
    }
  }
};

javascriptGenerator.forBlock.calculate_tephra_vei_wind = function(block) {
  const location = block.getFieldValue('locations');
  const wind_samples = javascriptGenerator.valueToCode(block, 'wind samples', Order.ATOMIC) || "null";
  const value_vei = javascriptGenerator.valueToCode(block, 'vei', Order.ATOMIC) || "undefined";
  const collection = block.getFieldValue('collections');

  const code = `computeTephra({location: "${location}", windSamples: ${wind_samples}, vei: ${value_vei}, collection: "${collection}"});`;

  return code;
};
