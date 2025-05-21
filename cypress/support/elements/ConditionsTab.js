class ConditionsTab {
    getConditionsPanel(){
        return cy.get('[data-test=Conditions-panel]');
    }
    getWindSpeedDirectionWidget(){
        return cy.get('[data-test=wind-info-widget]');
    }
    getWindSymbol(){
        return cy.get('[data-name="Wind Symbol -blue"]');
    }
    getVEIWidget(){
        return cy.get('[data-test=vei-widget]');
    }
    getEjectedVolumeWidget(){
        return cy.get('[data-test=ejected-volume-widget]');
    }
    getColumnHeightWidget(){
        return cy.get('[data-test=column-height-widget]');
    }
    getEjectedVolumeHeightVisual(){
        return cy.get('[data-test="ejected-volume-height-visual"]');
    }
    getColumnHeightVisual(){
        return cy.get('[data-test="column-height-visual"]');
    }
    getTephra(){
        return cy.get('.leaflet-zoom-animated .leaflet-interactive');
    }
    getVentLocationWidget(){
        return cy.get('[data-test=vent-location-widget]');
    }
    getLavaFrontHeightWidget(){
        return cy.get('[data-test=lava-front-height-widget]');
    }
    getVolumeOfLavaWidget(){
        return cy.get('[data-test=volume-of-lava-widget]');
    }
}

export default ConditionsTab;
