import * as Blockly from "blockly";

Blockly.Blocks['setEruptionHeight'] = {
    init: function() {
      this.appendValueInput("columnHeight")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Set column height");
      this.appendDummyInput()
          .appendField("km");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(32);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['setEruptionHeight'] = function(block) {
    var value_columnHeight = Blockly.JavaScript.valueToCode(block, 'columnHeight', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = `
      setColumnHeight(${value_columnHeight});
    `;
    return code;
  }
