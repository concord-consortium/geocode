import * as strings from "../strings/blockly-blocks/deformation/deformation";

Blockly.Blocks['run-from-year-loop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(strings.RUN_FROM_YEAR_1)
        .appendField(new Blockly.FieldNumber(500, 0, 500), "max_year")
        .appendField(strings.BY)
        .appendField(new Blockly.FieldDropdown([["1","1"], ["10","10"], ["20","20"]]), "year_step")
        .appendField(strings.YEARS);
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("%{BKY_LOGIC_HUE}")
    this.setTooltip(strings.STEP_THROUGH);
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['run-from-year-loop'] = function(block) {
  var number_max_year = block.getFieldValue('max_year');

  var dropdown_year_step = block.getFieldValue('year_step');
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');

  var code = 'createNewRun();\n';

  code += 'for (var year = ' + dropdown_year_step + '; ' +
      'year <= ' + number_max_year + '; ' +
      'year += ' + dropdown_year_step + ') {\n' +
      branch +
      '};\n';
  return code;
};