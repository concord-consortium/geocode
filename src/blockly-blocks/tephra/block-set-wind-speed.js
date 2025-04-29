import { SET_WIND_SPEED, MS, WIND_SPEED_TOOLTIP } from "../../strings/blockly-blocks/tephra/controls-panel";

Blockly.Blocks.setWindSpeed = {
    init() {
      this.appendValueInput("windSpeed")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(SET_WIND_SPEED);
      this.appendDummyInput()
          .appendField(MS);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(32);
   this.setTooltip(WIND_SPEED_TOOLTIP);
   this.setHelpUrl(WIND_SPEED_TOOLTIP);
    }
  };
  
  Blockly.JavaScript.setWindSpeed = function(block) {
    const value_wind_speed = Blockly.JavaScript.valueToCode(block, 'windSpeed', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    const code = `
      setWindspeed(${value_wind_speed});
  
    `;
    return code;
  };
  
