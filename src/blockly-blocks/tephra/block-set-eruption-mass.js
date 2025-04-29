import { SET_ERUPTION_MASS, KG } from "../../strings/blockly-blocks/tephra/controls-panel";

Blockly.Blocks.setEruptionMass = {
    init() {
      this.appendValueInput("eruptionMass")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(SET_ERUPTION_MASS);
      this.appendDummyInput()
          .appendField(KG);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(32);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };
  
  Blockly.JavaScript.setEruptionMass = function(block) {
    const value_mass = Blockly.JavaScript.valueToCode(block, 'eruptionMass', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    const code = `
      setMass(${value_mass});
    `;
    return code;
  };
  
