import { REDRAW_MAP, ERUPT_VOLCANO } from "../../strings/blockly-blocks/tephra/redraw-map";

Blockly.Blocks.redrawMap = {
    init() {
      this.appendDummyInput()
          .appendField(REDRAW_MAP);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#EB0000");
      this.setTooltip(ERUPT_VOLCANO);
      this.setHelpUrl(ERUPT_VOLCANO);
    }
  };

  Blockly.JavaScript.redrawMap = function(block) {
    // TODO: Assemble JavaScript into code variable.
    const code = '//...;\n';
    return code;
  };
