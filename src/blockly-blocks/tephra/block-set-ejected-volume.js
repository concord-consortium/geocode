import { SET_EJECTED_VOLUME, KM_CUBED } from '../../strings/blockly-blocks/tephra/controls-panel';

Blockly.Blocks.setEjectedVolume = {
    init() {
      this.appendValueInput("ejectedVolume")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(SET_EJECTED_VOLUME);
      this.appendDummyInput()
          .appendField(KM_CUBED);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(32);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };

  Blockly.JavaScript.setEjectedVolume = function(block) {
    const value_volume = Blockly.JavaScript.valueToCode(block, 'ejectedVolume', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    const code = `
      setVolume(${value_volume});
    `;
    return code;
  };
