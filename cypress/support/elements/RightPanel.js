class RightPanel {
    getConditionsTab(){
        return cy.get('[data-test=Conditions-tab')
    }
    getCrossSectionTab(){
        return cy.get('[data-test=Cross-Section-tab')
    }
    getDataTab(){
        return cy.get('[data-test=Data-tab')
    }
}

export default RightPanel;