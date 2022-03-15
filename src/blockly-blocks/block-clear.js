import { CLEAR, CLEAR_TOOLTIP } from "../strings/blockly-blocks/all-other-blocks"

Blockly.Blocks['clear'] = {
    init: function() {
      this.appendValueInput("logString")
          .setCheck("String")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(CLEAR);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(165);
   this.setTooltip(CLEAR_TOOLTIP);
   this.setHelpUrl("");
    }
  };
  
  Blockly.JavaScript['clear'] = function(block) {
    const code ='clearCanvas();\n';
    return code;
  }