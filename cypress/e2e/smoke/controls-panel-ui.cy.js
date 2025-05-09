import ModelOptions from "../../support/elements/ModelOptionPanel";
import LeftPanel from "../../support/elements/LeftPanel";
import ControlsTab from "../../support/elements/ControlsTab";

const modelOptions = new ModelOptions;
const leftPanel = new LeftPanel;
const controlsTab = new ControlsTab;

context("Controls panel", () => {
    before(() => {
      cy.visit("");
      modelOptions.getModelOptionsMenu().click();
      modelOptions.getShowControlsOption().click();
      modelOptions.getModelOptionsMenu().click();

      leftPanel.getControlsTab().should('be.visible').click();
    });

    describe("Controls panel ui", () => {
      it('verify Controls tab shows correct elements',()=>{
        controlsTab.getControlsPanel().should('be.visible');
        controlsTab.getWindSpeedDirectionContainer().should('be.visible');
        controlsTab.getEjectedVolumeContainer().should('be.visible');
        controlsTab.getColumnHeightContainer().should('be.visible');
        controlsTab.getVEIContainer().should('be.visible');
        controlsTab.getWindSpeedSlider().should('be.visible');
        controlsTab.getWindDirectionSlider().should('be.visible');
        controlsTab.getEjectedVolumeSlider().should('be.visible');
        controlsTab.getColumnHeightSlider().should('be.visible');
        controlsTab.getVEISlider().should('be.visible');
        cy.get(controlsTab.getResetButtonEl()).should('be.visible');
        controlsTab.getEruptButton().should('be.visible');
      });
    });
  });
