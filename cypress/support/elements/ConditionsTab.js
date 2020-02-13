class ConditionsTab {
    getConditionsPanel(){
        return cy.get('[data-test=Conditions-panel]')
    }
    getWindDirectionWidget(){
        return cy.get('[data-test=wind-info-widget]')
    }
    getVEIWidget(){
        return cy.get('[data-test=vei-widget]')
    }
    getEjectedVolumeWidget(){
        return cy.get('[data-test=ejected-volume-widget]')
    }
    getColumnHeightWidget(){
        return cy.get('[data-test=column-height-widget]')
    }
}

export default ConditionsTab