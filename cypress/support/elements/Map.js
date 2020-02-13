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
    getDrawCrossSectionLineButton(){
        return cy.get('[data-test="Draw a cross section line-button"]')
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