class Map {
    getMap(){
        return cy.get('.map')
    }
    getRecenterButton(){
        return cy.get('[data-test=Re-center-button]');
    }
    getRulerButton(){
        return cy.get('[data-test=Ruler-button]');
    }
    getKeyButton(){
        return cy.get('[data-test=Key-button]');
    }
    getDrawCrossSectionLineButtonOff(){
        return cy.get('[data-test="not-drawing-cross-section"]')
    }
    getDrawCrossSectionLineButtonOn(){
        return cy.get('[data-test="drawing-cross-section"]')
    }
    drawCrossSectionLine(){
        this.getDrawCrossSectionLineButton().click()
        this.getMap()
            .trigger('mousedown', {clientX:805, clientY:505})
            .trigger('mousemove', {offsetX:275, offsetY:0})
            .trigger('mouseup');
    }
    getMap(){
        return cy.get('.map')
    }
}

export default Map;