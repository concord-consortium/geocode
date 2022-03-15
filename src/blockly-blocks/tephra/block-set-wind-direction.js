import { SET_WIND_DIRECTION, DEGREES, WIND_TOOLTIP } from "../../strings/blockly-blocks/tephra/controls-panel";

Blockly.Blocks['setWindDirection'] = {
    init: function() {
      this.appendValueInput("windDirection")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(SET_WIND_DIRECTION);
      this.appendDummyInput()
          .appendField(DEGREES);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(32);
   this.setTooltip(WIND_TOOLTIP);
   this.setHelpUrl(WIND_TOOLTIP);
    }
  };
  
  Blockly.JavaScript['setWindDirection'] = function(block) {
    var value_winddirection = Blockly.JavaScript.valueToCode(block, 'windDirection', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = `
      setWindDirection(${value_winddirection});
  
    `;
    return code;
  }
  