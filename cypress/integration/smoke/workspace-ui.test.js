import LeftPanel from "../../support/elements/LeftPanel"
import RightPanel from "../../support/elements/RightPanel"
import CodeTab from "../../support/elements/CodeTab"
import ControlsTab from "../../support/elements/ControlsTab"
import ConditionsTab from "../../support/elements/ConditionsTab"
import CrossSectionTab from "../../support/elements/CrossSectionTab"
import DataTab from "../../support/elements/DataTab"



const leftPanel = new LeftPanel;
const rightPanel = new RightPanel;
const codeTab = new CodeTab;
const controlsTab = new ControlsTab;
const conditionsTab = new ConditionsTab;
const crossSectionTab = new CrossSectionTab;
const dataTab = new DataTab;

context("Test app workspace", () => {
  before(() => {
    cy.visit("");
  });

  describe("left side workspace", () => {
    it("verify correct tabs are visible", () => {
        leftPanel.getBlocksTab().should('be.visible');
        leftPanel.getCodeTab().should('be.visible');
        leftPanel.getControlsTab().should('be.visible');
        rightPanel.getConditionsTab().should('be.visible');
        rightPanel.getMonteCarloTab().should('be.visible');
        rightPanel.getDataTab().should('be.visible')
    });
  });
})
