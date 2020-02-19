import LeftPanel from "../../support/elements/LeftPanel"
import ControlsTab from "../../support/elements/ControlsTab"
import RightPanel from "../../support/elements/RightPanel";
import ConditionsTab from "../../support/elements/ConditionsTab"

const leftPanel = new LeftPanel;
const controlsTab = new ControlsTab;
const rightPanel = new RightPanel;
const conditionsTab = new ConditionsTab;

beforeEach(()=>{
    cy.fixture('vei-mapping.json').as('veiMap');
})
context("Controls panel", () => {
    var wsSlider='wind-speed', windSpeed = 15;
    var wdSlider="wind-direction", windDirection = 190;
    var evSlider="ejected-volume", volume = '2', evHeight='17.5';
    var chSlider="column-height", cHeight = '15', visualHeight='28.8';


    before(() => {
      cy.visit("");
      leftPanel.getControlsTab().should('be.visible').click();
      controlsTab.setSliderValue(wsSlider,windSpeed);
      controlsTab.setSliderValue(wdSlider,windDirection);
      controlsTab.setSliderValue(evSlider,volume);
      controlsTab.setSliderValue(chSlider, cHeight)
      controlsTab.getEruptButton().click();
    });
    describe('Verify control tab slider settings reflect in the conditions tab widget',()=>{
        it('verify wind speed widget',()=>{
            conditionsTab.getWindSpeedDirectionWidget().find('[data-test=info]').should('contain',windSpeed +' m/s')   
        })
        it('verify wind direction slider',()=>{
            conditionsTab.getWindSpeedDirectionWidget().find('[data-test=info]').should('contain',windDirection)    
            conditionsTab.getWindSymbol().parent().parent().should('have.attr','rotate',windDirection.toString())
        })
        it('verify eject volume widget',()=>{
            conditionsTab.getEjectedVolumeWidget().find('[data-test=info]').should('contain',volume)    
            conditionsTab.getEjectedVolumeHeightVisual().siblings('div').should('have.attr','height',evHeight, {multiple:true})
        })
        it('verify column height widget',()=>{
            conditionsTab.getColumnHeightWidget().find('[data-test=info]').should('contain',cHeight)    
            conditionsTab.getColumnHeightVisual().should('have.attr','height',visualHeight)
        })
    })
    describe('verify tephra after eruption',()=>{
        it('verify tephra is visible',()=>{
            conditionsTab.getTephra().should('be.visible');
        })
        it('verify switching to Cross Section tab shows tephra',()=>{
            rightPanel.getCrossSectionTab().click();
            conditionsTab.getTephra().should('be.visible');
        })
        it('verify Reset in Control Panel removes tephra in Cross Section tab',()=>{
            controlsTab.getControlsPanel().find(controlsTab.getResetButtonEl()).click();
            conditionsTab.getTephra().should('not.exist');
        })
        it('verify Conditions tab does not show tephra',()=>{
            rightPanel.getConditionsTab().click();
            conditionsTab.getTephra().should('not.exist');
        })
        it('verify Erupt while in Cross Section tab shows tephra in Cross Section tab',()=>{
            rightPanel.getCrossSectionTab().click();
            controlsTab.getEruptButton().click();
            conditionsTab.getTephra().should('be.visible');
        })
        it('verify tephra is still visible after switch back to Conditions tab',()=>{
            rightPanel.getConditionsTab().click();
            conditionsTab.getTephra().should('be.visible');
        })
    })
});