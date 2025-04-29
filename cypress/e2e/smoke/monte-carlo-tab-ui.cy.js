import RightPanel from "../../support/elements/RightPanel";
import MonteCarloTab from "../../support/elements/MonteCarloTab";
import Map from "../../support/elements/Map";

const rightPanel = new RightPanel;
const monteCarloTab = new MonteCarloTab;
const map = new Map;

context("Monte Carlo panel", () => {
    before(() => {
      cy.visit("");
      rightPanel.getMonteCarloTab().should('be.visible').click();
    });

    describe("Monte Carlo panel ui", () => {
        it('verify Monte Carlo tab shows correct elements',()=>{
            monteCarloTab.getMonteCarloPanel().should('be.visible');
            monteCarloTab.getHistogramPanel().should('exist');
            map.getRecenterButton().should('be.visible');
            map.getRulerButton().should('be.visible');
            map.getKeyButton().should('be.visible');
            map.getMap().should('be.visible');
        });
    });
  });
