import LeftPanel from "../../support/elements/LeftPanel"
import RightPanel from "../../support/elements/RightPanel"

const leftPanel = new LeftPanel;
const rightPanel = new RightPanel;

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
