import LeftPanel from "../../support/elements/LeftPanel";
import RightPanel from "../../support/elements/RightPanel";

const leftPanel = new LeftPanel;
const rightPanel = new RightPanel;

context("Test app workspace", () => {
  before(() => {
    cy.visit("");
  });

  describe("left side workspace", () => {
    it("verify correct tabs are visible", () => {
      leftPanel.getBlocksTab().should('be.visible');
      leftPanel.getCodeTab().should('not.exist');
      leftPanel.getControlsTab().should('not.exist');
      rightPanel.getConditionsTab().should('be.visible');
      rightPanel.getMonteCarloTab().should('be.visible');
      rightPanel.getDataTab().should('be.visible');
    });
  });
});
