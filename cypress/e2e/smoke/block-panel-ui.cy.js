import LeftPanel from "../../support/elements/LeftPanel";
import BlocksTab from "../../support/elements/BlocksTab";
import ModelOptions from "../../support/elements/ModelOptionPanel";

const leftPanel = new LeftPanel;
const blocksTab = new BlocksTab;
const modelOptions = new ModelOptions;

context("Blocks panel", () => {
    before(() => {
      cy.visit("");
      leftPanel.getBlocksTab().should('be.visible').click();
    });

    describe("block panel ui", () => {
      it('verify Blocks tab shows correct elements',()=>{
        blocksTab.getBlockPanel().should('be.visible');
        blocksTab.getTag('Volcano').should('be.visible');
        blocksTab.getTag('Logic').should('be.visible');
        blocksTab.getTag('Loops').should('be.visible');
        blocksTab.getTag('Data').should('be.visible');
        blocksTab.getTag('Variables').should('be.visible');
        blocksTab.getTag('Functions').should('be.visible');
        blocksTab.getRunButton().should('be.visible');
        blocksTab.getStepButton().should('be.visible');
        blocksTab.getResetButton().should('be.visible');
      });
      it('verify Run button switches to Pause after click and vice versa',()=>{
        modelOptions.getModelOptionsMenu().click();
        modelOptions.selectInitialCode("Nested loops");
        cy.wait(200);
        blocksTab.getRunButton().click();
        blocksTab.getPauseButton().should('be.visible');
        blocksTab.getPauseButton().click();
        blocksTab.getRunButton().should('be.visible');
      });
    });
  });
