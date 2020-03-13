import LeftPanel from "../../support/elements/LeftPanel"
import BlocksTab from "../../support/elements/BlocksTab"

const leftPanel = new LeftPanel;
const blocksTab = new BlocksTab;

context("Blocks panel", () => {
    before(() => {
      cy.visit("");
      leftPanel.getBlocksTab().should('be.visible').click();
    });

    describe("block panel ui", () => {
      it('verify Blocks tab shows correct elements',()=>{
        blocksTab.getBlockPanel().should('be.visible');
        blocksTab.getVolcanoTag().should('be.visible');
        blocksTab.getVariablesTag().should('be.visible');
        blocksTab.getRunButton().should('be.visible');
        blocksTab.getStepButton().should('be.visible');
        blocksTab.getResetButton().should('be.visible');
      })
      it('verify Run button switches to Pause after click and vice versa',()=>{
          blocksTab.getRunButton().click();
          blocksTab.getPauseButton().should('be.visible');
          blocksTab.getPauseButton().click();
          blocksTab.getRunButton().should('be.visible');
      })
    });
  });