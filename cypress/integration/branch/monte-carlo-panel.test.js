import LeftPanel from "../../support/elements/LeftPanel"
import ControlsTab from "../../support/elements/ControlsTab"
import RightPanel from "../../support/elements/RightPanel";
import ConditionsTab from "../../support/elements/ConditionsTab"
import Map from "../../support/elements/Map"
import BlocksTab from "../../support/elements/BlocksTab";
import MonteCarloTab from "../../support/elements/MonteCarloTab";
import ModelOptions from "../../support/elements/ModelOptionPanel";

const leftPanel = new LeftPanel;
const controlsTab = new ControlsTab;
const rightPanel = new RightPanel;
const conditionsTab = new ConditionsTab;
const map = new Map;
const blocksTab = new BlocksTab;
const monteCarloTab = new MonteCarloTab;
const modelOptions = new ModelOptions;

before(() => {
    cy.visit("");
    modelOptions.getModelOptionsMenu().click();
    modelOptions.selectInitialCode('Monte Carlo (2 locs)');
    modelOptions.
  });