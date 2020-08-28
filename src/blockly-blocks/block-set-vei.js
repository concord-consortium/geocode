import * as Blockly from "blockly";

Blockly.Blocks['setVEI'] = {
    init: function() {
      this.appendValueInput("vei")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Set VEI (1-8)");
      this.appendDummyInput();
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(32);
      this.setTooltip("Volcanic Explosivity Index");
      this.setHelpUrl("Volcanic Explosivity Index");
    }
  };

Blockly.JavaScript['setFoo'] = function(block) {
  var foo = Blockly.JavaScript.valueToCode(block, 'foo', Blockly.JavaScript.ORDER_ATOMIC);

  if (foo === "") {
    window.blocklyErrorMessage = "You are missing an input for 'Foo'";
  }

  // [...]
}