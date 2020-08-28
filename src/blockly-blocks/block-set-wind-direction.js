import * as Blockly from "blockly";

Blockly.Blocks['setWindDirection'] = {
    init: function() {
      this.appendValueInput("windDirection")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Set wind direction");
      this.appendDummyInput()
          .appendField("degrees");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(32);
   this.setTooltip("Compass direction,  0 == north 180 == south");
   this.setHelpUrl("Compass direction,  0 == north 180 == south");
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
