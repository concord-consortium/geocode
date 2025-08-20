import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import { blocklyStore } from "../../stores/blockly-store";
import * as strings from "../../strings/blockly-blocks/tephra/risk-level";

Blockly.Blocks.show_risk = {
  init() {
    this.appendDummyInput()
        .appendField(strings.SHOW_RISK);
    this.appendDummyInput()
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(strings.DATA_COLLECTION)
        .appendField(new Blockly.FieldDropdown(this.generateOptions), strings.COLLECTIONS);
    this.appendDummyInput()
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(strings.ABOVE_THRESHOLD)
        .appendField(new Blockly.FieldNumber(200), strings.THRESHOLD)
        .appendField(strings.MM);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  },

  generateOptions() {
    if (blocklyStore.sampleCollections && blocklyStore.sampleCollections.length > 0) {
      return blocklyStore.sampleCollections;
    } else {
      return [[strings.CREATE_COLLECTION,""]];
    }
  }
};

javascriptGenerator.forBlock.show_risk = function (block) {
  const collection = block.getFieldValue(strings.COLLECTIONS);
  const threshold = block.getFieldValue(strings.THRESHOLD);

  const code = `showRisk({collection: "${collection}", threshold: ${threshold}});\n`;
  return code;
};
