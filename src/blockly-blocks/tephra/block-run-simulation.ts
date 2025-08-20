import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import * as strings from '../../strings/blockly-blocks/tephra/run-simulation';

const { RIGHT } = Blockly.inputs.Align;

Blockly.Blocks.run_simulation = {
  init() {
    this.appendDummyInput()
        .appendField(strings.RUN_SIMULATION);
    this.appendValueInput("vei")
        .setCheck("Number")
        .setAlign(RIGHT)
        .appendField(strings.VEI);
    this.appendValueInput("wind_speed")
        .setCheck("Number")
        .setAlign(RIGHT)
        .appendField(strings.WIND_SPEED_MS);
    this.appendValueInput("wind_direction")
        .setCheck("Number")
        .setAlign(RIGHT)
        .appendField(strings.WIND_DIRECTION);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#EB0000");
    this.setTooltip(strings.SIMULATION_PARAMETERS);
    this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock.run_simulation = function(block) {
  const value_vei = javascriptGenerator.valueToCode(block, 'vei', Order.ATOMIC);
  const value_wind_speed = javascriptGenerator.valueToCode(block, 'wind_speed', Order.ATOMIC);
  const value_direction = javascriptGenerator.valueToCode(block, 'wind_direction', Order.ATOMIC);
  const code = `
    var vei=${value_vei};
    var speed=${value_wind_speed};
    var direction=${value_direction};
    this.setVEI(vei);
    this.setWindspeed(speed);
    this.setWindDirection(direction);
    this.erupt();
    this.paintMap();
  `;
  return code;
};
