import LeftPanel from "../../support/elements/LeftPanel"
import ControlsTab from "../../support/elements/ControlsTab"

const leftPanel = new LeftPanel;
const controlsTab = new ControlsTab;
beforeEach(()=>{
    cy.fixture('vei-mapping.json').as('veiMap');
})
context("Controls panel", () => {
    before(() => {
      cy.visit("");
      leftPanel.getControlsTab().should('be.visible').click();
    });
    describe('slider/widget tests',()=>{
        it('verify wind speed slider',()=>{
            var slider='wind-speed', windSpeed = 19;
            controlsTab.setSliderValue(slider,windSpeed);
            controlsTab.getWindSpeedDirectionContainer().find('[data-test=info]').should('contain',windSpeed +' m/s')    
        })
        it('verify wind direction slider',()=>{
            var slider="wind-direction", windDirection = 190;
            controlsTab.setSliderValue(slider,windDirection);
            controlsTab.getWindSpeedDirectionContainer().find('[data-test=info]').should('contain',windDirection)    
            controlsTab.getWindSymbol().parent().parent().should('have.attr','rotate',windDirection.toString())
        })
        it('verify ejected volumne slider',()=>{
            var slider="ejected-volume", volume = '2', height='17.5';
            controlsTab.setSliderValue(slider,volume);
            controlsTab.getEjectedVolumeContainer().find('[data-test=info]').should('contain',volume)    
            controlsTab.getEjectedVolumeHeightVisual().siblings('div').should('have.attr','height',height, {multiple:true})
        })
        it('verify column height slider',()=>{
            var slider="column-height", height = '15', visualHeight='28.8';
            controlsTab.setSliderValue(slider, height)
            controlsTab.getColumnHeightContainer().find('[data-test=info]').should('contain',height)    
            controlsTab.getColumnHeightVisual().should('have.attr','height',visualHeight)
        })
        it('verify VEI slider',()=>{ 
            var slider='vei', sliderValue=-0.1, value='1';
            controlsTab.setSliderValue(slider,sliderValue)
            cy.get('@veiMap').then((veiMap)=>{
                cy.log(veiMap.map[value-1].type)
                controlsTab.getVEIContainer().find('[data-test=info] div:nth-of-type(2)').should('contain',veiMap.map[value-1].value+': '+veiMap.map[value-1].type)    
            })
            controlsTab.getVEIContainer().find('[data-test=info] svg').should('have.attr','data-name','VEI '+value+" - orange")
        })
        it('verify VEI change when Ejected Volume is changed',()=>{
            var expectedVEI=5;
            controlsTab.setSliderValue('ejected-volume',3)
            cy.get('@veiMap').then((veiMap)=>{
                cy.log(veiMap.map[expectedVEI-1].type)
                controlsTab.getVEIContainer().find('[data-test=info] div:nth-of-type(2)').should('contain',veiMap.map[expectedVEI-1].value+': '+veiMap.map[expectedVEI-1].type)    
            })
            controlsTab.getVEIContainer().find('[data-test=info] svg').should('have.attr','data-name','VEI '+expectedVEI+" - orange")
        })
        it('verify VEI is changed when Column Height is changed',()=>{
            var expectedVEI=7;
            controlsTab.setSliderValue('column-height',20)
            cy.get('@veiMap').then((veiMap)=>{
                cy.log(veiMap.map[expectedVEI-1].type)
                controlsTab.getVEIContainer().find('[data-test=info] div:nth-of-type(2)').should('contain',veiMap.map[expectedVEI-1].value+': '+veiMap.map[expectedVEI-1].type)    
            })
            controlsTab.getVEIContainer().find('[data-test=info] svg').should('have.attr','data-name','VEI '+expectedVEI+" - orange")
        })
        it('verify ejected Volume and column height is changed when VEI is changed',()=>{
            var vei=6;
            controlsTab.setSliderValue('vei',vei)
            cy.get('@veiMap').then((veiMap)=>{
                cy.log("column: "+veiMap.map[vei-1].column+" ejected volume: "+veiMap.map[vei-1].ejectedVolume)
                controlsTab.getVEIContainer().find('[data-test=info] div:nth-of-type(2)').should('contain',veiMap.map[vei-1].value+': '+veiMap.map[vei-1].type) 
                controlsTab.getColumnHeightContainer().find('[data-test=info]').should('contain',veiMap.map[vei-1].column) 
                controlsTab.getEjectedVolumeContainer().find('[data-test=info]').should('contain',veiMap.map[vei-1].ejectedVolume)       
            })
            controlsTab.getVEIContainer().find('[data-test=info] svg').should('have.attr','data-name','VEI '+vei+" - orange")
        })
    })
})    