class LeftPanel {
    getBlocksTab(){
        return cy.get('[data-test=Blocks-tab')
    }
    getCodeTab(){
        return cy.get('[data-test=Code-tab')
    }
    getControlsTab(){
        return cy.get('[data-test=Controls-tab')
    }
}

export default LeftPanel