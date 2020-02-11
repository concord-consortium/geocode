import LeftPanel from "../support/elements/LeftPanel"
import CodeTab from "../support/elements/CodeTab"

const leftPanel = new LeftPanel;
const codeTab = new CodeTab;

context("Blocks panel", () => {
    before(() => {
      cy.visit("");
      leftPanel.getBlocksTab().should('be.visible').click();
    });
  
    describe("block panel ui", () => {
      it('verify Blocks tab shows correct elements',()=>{
        codeTab.getBlockPanel().should('be.visible');
        blocksTab.getVolcanoTag().should('be.visible');
        blocksTab.getVariablesTag().should('be.visible');
        blocksTab.getRunButton().should('be.visible');
        blocksTab.getStepButton().should('be.visible');
        blocksTab.getResetButton().should('be.visible');
      })
      it('verify Run button switches to Stop after click and vice versa',()=>{
          blocksTab.getRunButton().click();
          blocksTab.getStopButton().should('be.visible');
          blocksTab.getStopButton().click();
          blocksTab.getRunButton().should('be.visible');
      })
    });
  });