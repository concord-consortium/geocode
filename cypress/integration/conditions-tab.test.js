import rightPanel from "../support/elements/rightPanel"
import ConditionsTab from "../support/elements/ConditionsTab"

const rightPanel = new rightPanel;
const conditionsTab = new ConditionsTab;

context("Blocks panel", () => {
    before(() => {
      cy.visit("");
      leftPanel.getBlocksTab().should('be.visible').click();
    });
  
    describe("conditions panel ui", () => {
        it('verify Conditions tab shows correct elements',()=>{
            conditionsTab.getConditionsPanel().should('be.visible');

        })
        it('verify Run button switches to Stop after click and vice versa',()=>{
            blocksTab.getRunButton().click();
            blocksTab.getStopButton().should('be.visible');
            blocksTab.getStopButton().click();
            blocksTab.getRunButton().should('be.visible');
        })
        it('maps should render',()=>{

        })
        it('tephra renders correctly after switching tabs',()=>{
        
        })
    });
  });