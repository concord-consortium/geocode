import { THICKNESS } from "../../strings/blockly-blocks/tephra/thickness"

Blockly.Blocks['thickness'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(THICKNESS);
      this.setOutput(true, null);
      this.setColour(230);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };
  
  
  Blockly.JavaScript['thickness'] = function(block) {
    // TODO: Assemble JavaScript into code variable.
    var code = `(this.thickness)`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_NONE];
  }
  