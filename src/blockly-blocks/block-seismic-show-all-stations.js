Blockly.Blocks['seismic_show_all_stations'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Show all GPS stations");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['seismic_show_all_stations'] = function(block) {
  var code = `
    this.showAllStations();
  `;
  return code;
};