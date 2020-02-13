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
    getSliderTrackEl(){
        return '[data-test=slider-rail]'
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
    getWindSymbol(){
        return cy.get('[data-name="Wind Symbol - orange"]')
    }
    getEjectedVolumeHeightVisual(){
        return cy.get('[data-test="ejected-volume-height-visual"]')
    }
    getColumnHeightVisual(){
        return cy.get('[data-test="column-height-visual"]')
    }
    getResetButton(){
        return cy.get('[data-test=Reset-button]')
    }
    getEruptButton(){
        return cy.get('[data-test=Erupt-button]')
    }
    setSliderValue(slider, value){ //pass in -0.1 as value for min slider value
        var unit=0;
        switch (slider) {
            case "wind-speed":
                unit=9.21;
                break;
            case "wind-direction":
                unit=0.78;
                break;
            case "ejected-volume":
                unit=110;
                break;
            case "column-height":
                unit=11.007;
                break;
            case "vei":
                unit=27;
                break;            
        } 
        cy.log("slider: "+slider+" value: "+value+" unit: "+unit+" slider to: "+value*unit)
        cy.get('[data-test='+slider+'-slider]').find(this.getSliderTrackEl()).click(value*unit,-1,{force:true})
    }
}
export default ControlsTab;