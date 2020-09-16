Blockly.Blocks['deformation-create-sim'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("Run simulation");
      this.setColour(15)
    }
  };

  Blockly.JavaScript['deformation-create-sim'] = function(block) {
    const code ='createDeformationModel();\n';
    return code;
  }