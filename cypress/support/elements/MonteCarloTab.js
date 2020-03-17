class MonteCarloTab {
    getMonteCarloPanel(){
        return cy.get('[data-test=Monte-Carlo-panel]');
    }
    getHistogramPanel(){
        return cy.get('[data-test=histogram-tab-panel]');
    }
    getTabList(){
        return cy.get('[data-test=monte-carlo-locations-tab-list] li')
    }
    histogramChartContainerEl(){
        return ('[data-test="histogram-chart-container"]')
    }
    getHistogramChartContainer(){
        return cy.get(this.histogramChartContainerEl())
    }
    getStatsContainer(){
        return cy.get('[data-test="monte-carlo-stat-container"')
    }
    getThresholdLine(){
        return cy.get(this.histogramChartContainerEl()).find('line').last()
    }
    getThresholdLineText(){
        return cy.get(this.histogramChartContainerEl()).find('text').last()
    }
    getDataPoints(){
        return cy.get(this.histogramChartContainerEl()).find('circle')
        }
    riskDiamondEl(){
        return ('[data-test="risk-diamond"]')
    }
}

export default MonteCarloTab