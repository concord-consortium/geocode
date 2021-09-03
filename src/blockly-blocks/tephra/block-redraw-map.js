Blockly.Blocks['redrawMap'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Redraw the map");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#EB0000");
      this.setTooltip("have the volcano erupt");
      this.setHelpUrl("have the volcano erupt");
    }
  };

  Blockly.JavaScript['redrawMap'] = function(block) {
    // TODO: Assemble JavaScript into code variable.
    var code = '//...;\n';
    return code;
  }
