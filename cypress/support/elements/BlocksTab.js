class BlocksTab{
    //Blocks Tab
    getBlockPanel(){
        return cy.get('[data-test=Blocks-panel]')
     }
    getTag(tagName){ //tagName=['Volcano','Logic','Loops','Data','Variables','Functions']
        return cy.get('.blocklyTreeLabel').contains(tagName)
    }
    getFlyout(){
        return cy.get('.blocklyFlyout');
    }
    getFlyoutButtonEl(){
        return ('blocklyFlyoutButton')
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
    getBlockTextEl(){
        return '.blocklyDraggable .blocklyText'
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

    //Logic blocks
    getIfBlock(){
        return cy.get(this.getBlockTextEl()).contains('if')
    }
    getMathOperatorBlock(operator){
        return cy.get(this.getBlockEl()).find('[text-anchor="start"]').contains(operator)
    }
    getLogicOperatorBlock(logic){
        return cy.get(this.getBlockEl()).find('[text-anchor="start"]').contains(logic)
    }
    getNotBlock(){
        return cy.get(this.getBlockTextEl()).contains('not')
    }
    getBooleanBlock(state){
        return cy.get(this.getBlockEl()).find('[text-anchor="start"]').contains(state)
    }

    // Loop blocks
    getRepeatLoopBlock(){
        return cy.get(this.getBlockEl()).find('times')
    }
    setRepeatLoopBlock(num){
        this.getRepeatLoopBlock().within(()=>{
            cy.get('blocklyHtmlInput').type(num)
        })
    }
    getWhileLoopBlock(condition){
        return cy.get(this.getBlockEl()).find(condition)
    }
    setWhileLoopState(condition){
        this.getWhileLoopBlock().within(()=>{
            cy.get('[text-anchor="start]').click();
            cy.get('.goog-menuitem-content').contains(condition).click();
        })
    }
    getForLoopBlock(variable,fromNum,toNum, inc){

    }
    getForEachLoopBlock(variable){

    }
    getBreakBlock(state){

    }
    //
}
export default BlocksTab;