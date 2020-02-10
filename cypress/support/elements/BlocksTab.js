class BlocksTab{
    //Blocks Tab
    getBlockPanel(){
        return cy.get('[data-test=Blocks-panel]')
     }
    getVolcanoTag(){
         return cy.get('.blocklyTreeLabel').contains('Volcano')
    }
    getVariablesTag(){
        return cy.get('.blocklyTreeLabel').contains('Volcano')
    }
     getRunButton(){
        return cy.get('[data-test=Run-button]')
    }
    getStopButton(){
        return cy.get('[data-test=Stop-button]')
    }
    getStepButton(){
        return cy.get('[data-test=Step-button]')
    }
    getResetButton(){
        return cy.get('[data-test=Reset-button]')
    }
    runProgram(){
        this.getRunButton().click()
    }
}
export default BlocksTab;