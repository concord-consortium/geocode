class MonteCarloTab {
    getMonteCarloPanel(){
        return cy.get('[data-test=Cross-Section-panel]');
    }

    getTephraThicknessGraphContainer(){
        return cy.get('[data-test="tephra-thickness-cross-section-container"]')
    }
}

export default MonteCarloTab