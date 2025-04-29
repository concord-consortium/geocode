import { SET_COLUMN_HEIGHT, KM } from "../../strings/blockly-blocks/tephra/controls-panel";

Blockly.Blocks.setEruptionHeight = {
    init() {
      this.appendValueInput("columnHeight")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(SET_COLUMN_HEIGHT);
      this.appendDummyInput()
          .appendField(KM);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(32);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };
  
  Blockly.JavaScript.setEruptionHeight = function(block) {
    const value_columnHeight = Blockly.JavaScript.valueToCode(block, 'columnHeight', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    const code = `
      setColumnHeight(${value_columnHeight});
    `;
    return code;
  };
  
