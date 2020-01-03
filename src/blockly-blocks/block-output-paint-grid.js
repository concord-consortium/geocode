Blockly.Blocks['outputPaintGrid'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Color the grid")
          .appendField(new Blockly.FieldColour("#ff0000"), "COLOR")
          .appendField("by")
          .appendField(new Blockly.FieldDropdown([["tephra thickness", "thickness"]]), "result_type");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
   this.setTooltip("Color the results of the simulation in the grid with a color");
   this.setHelpUrl("");
    }
  };
  
  Blockly.JavaScript['outputPaintGrid'] = function(block) {
    var resultType = block.getFieldValue('result_type');
    var color = block.getFieldValue('COLOR');
    // TODO: Assemble JavaScript into code variable.
    var code = `
      paintGrid({resultType: "${resultType}", color: "${color}"});
    `;
    return code;
  }
  