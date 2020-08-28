import * as Blockly from "blockly";

Blockly.Blocks['stringconcat'] = {
  init: function() {
    this.appendValueInput("lv")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("+");
    this.appendValueInput("rv")
        .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, "String");
    this.setColour(260);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['stringconcat'] = function(block) {
  var value_lv = Blockly.JavaScript.valueToCode(block, 'lv', Blockly.JavaScript.ORDER_ATOMIC);
  var value_rv = Blockly.JavaScript.valueToCode(block, 'rv', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = ``;
  if (value_lv || value_rv) {
    code = ` stringConcat({lv: ${value_lv ? value_lv : null}, rv: ${value_rv ? value_rv : null}}) \n`;
  }
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};
