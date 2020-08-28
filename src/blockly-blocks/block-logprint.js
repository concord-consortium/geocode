import * as Blockly from "blockly";

Blockly.Blocks['logprint'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Print");
      this.appendValueInput("data")
          .setCheck(null);
      this.appendDummyInput()
          .appendField("to the log");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
   this.setTooltip("Print something to the log");
   this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['logprint'] = function(block) {
    var value_data = Blockly.JavaScript.valueToCode(block, 'data', Blockly.JavaScript.ORDER_ATOMIC);
    var code = `logInfo(${value_data});`;
    return code;
  };
