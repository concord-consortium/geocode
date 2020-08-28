import * as Blockly from "blockly";

Blockly.Blocks['outputPaintMap'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Color the map by tephra thickness")
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
   this.setTooltip("Color the results of the simulation in the map");
   this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['outputPaintMap'] = function(block) {
    // TODO: Assemble JavaScript into code variable.
    var code = `
      paintMap();
    `;
    return code;
  }
