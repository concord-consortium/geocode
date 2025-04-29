import RightPanel from "../../support/elements/RightPanel";
import ConditionsTab from "../../support/elements/ConditionsTab";
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
        });
        it.skip('map should render',()=>{
            //TODO https://www.pivotaltracker.com/story/show/171138096
        });
        it('verify Map key shows correct keys',()=>{
            map.getKeyButton().click();
            map.getKeyContainer().should('contain','Tephra Thickness');
            map.getMapKeyToggle().should('contain', 'Show Risk');
            map.getMapKeyToggle().click();
            map.getKeyContainer().should('contain','Risk Level');
            map.getMapKeyToggle().should('contain','Show Tephra');
        });
    });
  });
