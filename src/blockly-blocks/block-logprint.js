import { PRINT, TO_LOG, PRINT_TOOLTIP } from "..";

Blockly.Blocks.logprint = {
    init() {
      this.appendDummyInput()
          .appendField(PRINT);
      this.appendValueInput("data")
          .setCheck(null);
      this.appendDummyInput()
          .appendField(TO_LOG);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
   this.setTooltip(PRINT_TOOLTIP);
   this.setHelpUrl("");
    }
  };
  
  Blockly.JavaScript.logprint = function(block) {
    const value_data = Blockly.JavaScript.valueToCode(block, 'data', Blockly.JavaScript.ORDER_ATOMIC);
    const code = `logInfo(${value_data});`;
    return code;
  };
  
