class RightPanel {
    getConditionsTab(){
        return cy.get('[data-test=Conditions-tab]');
    }
    getCrossSectionTab(){
        return cy.get('[data-test=Cross-Section-tab]');
    }
    getDataTab(){
        return cy.get('[data-test=Data-tab]');
    }
    getMonteCarloTab(){
        return cy.get('[data-test=Monte-Carlo-tab]');
    }
}

export default RightPanel;
