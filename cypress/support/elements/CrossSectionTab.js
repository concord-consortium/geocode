class CrossSectionTab {
    getCrossSectionPanel(){
        return cy.get('[data-test=Cross-Section-panel]');
    }

    getTephraThicknessGraphContainer(){
        return cy.get('[data-test="tephra-thickness-cross-section-container"]')
    }
}

export default CrossSectionTab