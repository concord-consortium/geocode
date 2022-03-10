import { ERUPT_CURRENT, VOLCANO_ERUPT } from "../../strings/blockly-blocks/tephra/erupt";

Blockly.Blocks['erupt'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(ERUPT_CURRENT);
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#EB0000");
      this.setTooltip(VOLCANO_ERUPT);
      this.setHelpUrl(VOLCANO_ERUPT);
    }
  };

  Blockly.JavaScript['erupt'] = function(block) {
    var code = `
      erupt();
    `;
    return code;
  }
