Blockly.Blocks['outputPlot'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Add a point to the graph:");
      this.appendDummyInput()
          .appendField("   X:")
          .appendField(new Blockly.FieldDropdown([
            ["wind speed","windSpeed"],
            ["wind direction","windDirection"],
            ["column height","colHeight"],
            ["eruption mass","mass"],
            ["VEI","vei"]]
          ), "xData");
      this.appendDummyInput()
          .appendField("   Y:")
          .appendField(new Blockly.FieldDropdown([["tephra height","thickness"]]), "yData")
          .appendField("at")
          .appendField(new Blockly.FieldTextInput("(city)"), "city");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Add a new point to the graph");
      this.setHelpUrl("");
    }
  };
  
  Blockly.JavaScript['outputPlot'] = function(block) {
    var xData = block.getFieldValue('xData');
    var yData = block.getFieldValue('yData');
    var city = block.getFieldValue('city');
    console.log(xData, yData, city);
    // TODO: Assemble JavaScript into code variable.
    var code = `
      calculateAndAddPlotPoint({xData: "${xData}", yData: "${yData}", cityName: "${city}"});
    `;
    return code;
  };
  