import RightPanel from "../../support/elements/RightPanel"
import LeftPanel from "../../support/elements/LeftPanel"
import MonteCarloTab from "../../support/elements/MonteCarloTab"
import ControlsTab from "../../support/elements/ControlsTab"
import Map from "../../support/elements/Map";

const rightPanel = new RightPanel;
const leftPanel = new LeftPanel;
const monteCarloTab = new MonteCarloTab;
const map = new Map;
const controlsTab = new ControlsTab;

context("Cross Section panel", () => {
    before(() => {
      cy.visit("");
      rightPanel.getMonteCarloTab().should('be.visible').click();
    });

    describe("Monte Carlo panel ui", () => {
        it('verify Cross Section tab shows correct elements',()=>{
            monteCarloTab.getHistogramPanel().should('be.visible');
            map.getRecenterButton().should('be.visible');
            map.getRulerButton().should('be.visible');
            map.getKeyButton().should('be.visible');
            map.getMap().should('be.visible');
        })
        it.skip('verify Draw Cross section button only appears if volcano has erupted',()=>{
            leftPanel.getControlsTab().click();
            controlsTab.getEruptButton().click();
            map.getDrawCrossSectionLineButtonOff().should('be.visible')
        })
    });
  });