class BlocksTab{
    //Blocks Tab
    getBlockPanel(){
        return cy.get('[data-test=Blocks-panel]')
     }
    getTag(tagName){ //tagName=['Volcano','Logic','Loops','Data','Variables','Functions']
        return cy.get('.blocklyTreeLabel').contains(tagName)
    }
    getCanvas(){
        return cy.get('.blocklyBlockCanvas')
    }
    getRunButton(){
        return cy.get('[data-test=Run-button]')
    }
    getPauseButton(){
        return cy.get('[data-test=Pause-button]')
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
    getBlockEl(){
        return '.blocklyDraggable';
    }
    getEditableTextEl(){
        return '.blocklyEditableText';
    }
    setSpeedControl(speed){
        switch (speed) {
            case ("fast"):
                cy.get('[data-test=slider-rail').click("right")
                break;
            case ("slow"):
                cy.get('[data-test=slider-rail').click("left")
                break;
        }
    }

    //Data blocks
    getTextBlock(){
        return cy.get(this.getEditableTextEl())
    }
    editText(text, whichOne=0){
        cy.get('.blocklyWidgetDiv').find('.blocklyHtmlInput').eq(whichOne).type('{backspace}'+text+'{enter}');
    }
}
export default BlocksTab;