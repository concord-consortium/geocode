class ControlsTab{
    getControlsPanel(){
        return cy.get('[data-test=Controls-panel]')
    }
    getWindSpeedDirectionContainer(){
        return cy.get('[data-test=wind-direction-speed-slider-container]')
    }
    getEjectedVolumeContainer(){
        return cy.get('[data-test=ejected-volume-slider-container]')
    }
    getColumnHeightContainer(){
        return cy.get('[data-test=column-height-slider-container]')
    }
    getVEIContainer(){
        return cy.get('[data-test=vei-slider-container]')
    }
    getWindSpeedSlider(){
        return cy.get('[data-test=wind-speed-slider]')
    }
    getWindDirectionSlider(){
        return cy.get('[data-test=wind-direction-slider]')
    }
    getEjectedVolumeSlider(){
        return cy.get('[data-test=ejected-volume-slider]')
    }
    getColumnHeightSlider(){
        return cy.get('[data-test=column-height-slider]')
    }
    getVEISlider(){
        return cy.get('[data-test=vei-slider]')
    }
    getResetButton(){
        return cy.get('[data-test=Reset-button]')
    }
    getEruptButton(){
        return cy.get('[data-test=Erupt-button]')
    }
    setSliderValue(slider, value){
        cy.get('[data-test='+slider+'-slider]')
            .invoke('val', value)
            .trigger('change',{data: value})
    }    
}

export default ControlsTab;