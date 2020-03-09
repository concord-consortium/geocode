class MonteCarloTab {
    getMonteCarloPanel(){
        return cy.get('[data-test=Monte-Carlo-panel]');
    }

    getHistogramPanel(){
        return cy.get('[data-test="histogram-panel"]')
    }
}

export default MonteCarloTab