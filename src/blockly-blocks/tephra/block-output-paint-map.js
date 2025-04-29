import { COLOR_MAP, COLOR_RESULTS } from '../../strings/blockly-blocks/tephra/output-paint-map';

Blockly.Blocks.outputPaintMap = {
    init() {
      this.appendDummyInput()
          .appendField(COLOR_MAP);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#EB0000");
      this.setTooltip(COLOR_RESULTS);
      this.setHelpUrl("");
    }
  };

  Blockly.JavaScript.outputPaintMap = function(block) {
    // TODO: Assemble JavaScript into code variable.
    const code = `
      paintMap();
    `;
    return code;
  };
