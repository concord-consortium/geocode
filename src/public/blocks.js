
function drawRandomDot(radius=20) {
  const canvas = document.getElementById('canvas');
  const x = Math.random() * 400;
  const y = Math.random() * 400;
  const r = radius;
  const ctx = canvas.getContext('2d');
  // ctx.fillStyle = 'white';
  ctx.fillStyle = 'hsla(100, 70%, 95%, 0.7)';
  ctx.beginPath();
  ctx.ellipse(x, y, r, r, 0, 0, 2 * Math.PI);
  ctx.fill();
}

function clearCanvas() {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function run_js_from_textbox() {
  const codebox = document.getElementById('codebox');
  const value = codebox.value;
  eval(value);
};

Blockly.Blocks['console_logger'] = {
  init: function() {
    this.appendValueInput("logString")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("thingtoLog");
    this.setColour(165);
 this.setTooltip("Log something to the console");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['console_logger'] = function(block) {
  const value_logstring = Blockly.JavaScript.valueToCode(block, 'logString', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  const code = `console.log(${value_logstring});`;
  return code;
};

Blockly.Blocks['drawdot'] = {
  init: function() {
    this.appendValueInput("radius")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("circle radius");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
 this.setTooltip("draw a randomly located dot");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['drawdot'] = function(block) {
  var value_radius = Blockly.JavaScript.valueToCode(block, 'radius', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  const code=`drawRandomDot(${value_radius});\n`;
  return code;
};

Blockly.Blocks['console_log_from_blockly'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Run JS from textbox");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['console_log_from_blockly'] = function(block) {
  const code = `
    console.log('from blockly');\n
    console.log(count);\n
    console.log(rocks);\n
  `;
  return code;
};

Blockly.Blocks['clear'] = {
  init: function() {
    this.appendValueInput("logString")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("clear");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(165);
 this.setTooltip("clear the screen");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['clear'] = function(block) {
  const code ='clearCanvas();\n';
  return code;
};

