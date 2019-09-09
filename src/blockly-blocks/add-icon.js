Blockly.Blocks['addIcon'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Add Icon")
      .appendField(new Blockly.FieldDropdown(
        [
          ["Safe", "Safe"],
          [{
            "src": "/assets/yellow.png",
            "width": 15,
            "height": 15,
            "alt": "*"}, "yellow"
          ],
          [{
            "src": "/assets/orange.png",
            "width": 15,
            "height": 15,
            "alt": "*"}, "orange"
          ],
          [{
            "src": "/assets/red.png",
            "width": 15,
            "height": 15,
            "alt": "*"}, "red"
          ]
        ]), "Icon");
    this.appendValueInput("X")
      .setCheck("Number")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField("To Map")
      .appendField("X");
    this.appendValueInput("Y")
      .setCheck("Number")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField("To Map")
      .appendField("X");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};



Blockly.JavaScript['addIcon'] = function (block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'iconName', Blockly.JavaScript.ORDER_ATOMIC);
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  value_x = value_x || 1;
  value_y = value_y || 1;
  value_name = value_name || "'untitled'"
  var code = `
      console.log("adding icon ${value_x}, y: ${value_y}, name: ${value_name}")
      // addCity({x: ${value_x}, y: ${value_y}, name: ${value_name}});
    `
  return code;
}
