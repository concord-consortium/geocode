import RightPanel from "../../support/elements/RightPanel"
import ConditionsTab from "../../support/elements/ConditionsTab"
import Map from "../../support/elements/Map";

const rightPanel = new RightPanel;
const conditionsTab = new ConditionsTab;
const map = new Map;

context("Conditions panel", () => {
    before(() => {
      cy.visit("");
      rightPanel.getConditionsTab().should('be.visible').click();
    });
  
    describe("conditions panel ui", () => {
        it('verify Conditions tab shows correct elements',()=>{
            conditionsTab.getConditionsPanel().should('be.visible');
            map.getRecenterButton().should('be.visible');
            map.getRulerButton().should('be.visible');
            map.getKeyButton().should('be.visible');
            map.getMap().should('be.visible');
        })
        it.skip('maps should render',()=>{
            //TODO
        })
        it.skip('tephra renders correctly after switching tabs',()=>{
            //TODO
        })
    });
  });