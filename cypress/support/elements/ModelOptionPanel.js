class ModelOptions {
    getModelOptionsMenu(){
        return cy.get('.button .label-text').contains('Model options', { matchCase: false });
    }
    getModelOptionsList(){
        return cy.get('.dg.main li');
    }
    getRequireEruptionOption(){
        return cy.get('.label-text').contains('Require eruption?', { matchCase: false }).siblings('input')
    }
    getRequirePaintingOption(){
        return cy.get('.label-text').contains('Require painting?', { matchCase: false }).siblings('input')
    }
    selectMapScenario(scenario){
        cy.get('.select .label-text').contains('Map Scenario', { matchCase: false }).siblings().select(scenario);
    }
    selectCodeToolbox(toolbox){
        cy.get('.select .label-text').contains('Code toolbox', { matchCase: false }).siblings().select(toolbox);
    }
    selectInitialCode(codeType){
        cy.get('.label-text').contains('Initial code', { matchCase: false }).siblings().select(codeType);
    }
    getShowBlocksOption(){
        return cy.get('.label-text').contains('Show blocks?', { matchCase: false }).siblings('input')
    }
    getShowCodeOption(){
        return cy.get('.label-text').contains('Show code?', { matchCase: false }).siblings('input')
    }
    getShowControlsOption(){
        return cy.get('.label-text').contains('Show controls?', { matchCase: false }, { matchCase: false }).siblings('input')
    }
    getShowConditionsOption(){
        return cy.get('.label-text').contains('Show conditions?', { matchCase: false }).siblings('input')
    }
    getShowCrossSectionOption(){
        return cy.get('.label-text').contains('Show cross section?', { matchCase: false }).siblings('input')
    }
    getShowDataOption(){
        return cy.get('.label-text').contains('Show data?', { matchCase: false }).siblings('input')
    }
    getControlOptionFolderHeader(){
        return cy.get('li.folder .title').contains('Controls Options', { matchCase: false })
    }
    getShowWindSpeedOption(){
        return cy.get('.label-text').contains('Show Wind Speed?', { matchCase: false }).siblings('input')
    }
    getShowWindDirectionOption(){
        return cy.get('.label-text').contains('Show Wind Direction?', { matchCase: false }).siblings('input')
    }
    getShowEjectedVolumeOption(){
        return cy.get('.label-text').contains('Show Ejected Volume?', { matchCase: false }).siblings('input')
    }
    getShowColumnHeightOption(){
        return cy.get('.label-text').contains('Show Column Height?', { matchCase: false }).siblings('input')
    }
    getShowVEIOption(){
        return cy.get('.label-text').contains('Show VEI?', { matchCase: false }).siblings('input')
    }
    getShowSpeedControl(){
        return cy.get('.label-text').contains('Show Speed Controls?', { matchCase: false }).siblings('input')
    }
    getShowBarHistogram(){
        return cy.get('.label-text').contains('Show Bar Histogram?', { matchCase: false }).siblings('input')
    }
    getShowLogOption(){
        return cy.get('.label-text').contains('Show Log?', { matchCase: false }).siblings('input')
    }
    getShowDemoChartsOption(){
        return cy.get('.label-text').contains('Show Demo Charts?', { matchCase: false }).siblings('input')
    }
    getShowRiskDiamondsOption(){
        return cy.get('.label-text').contains('Show Risk Diamonds?', { matchCase: false }).siblings('input')
    }
    saveCurrentState(){
        return cy.get('.label-text').contains('Save current state to local storage', { matchCase: false })
    }
    restoreSavedState(){
        return cy.get('.label-text').contains('Load state from local storage', { matchCase: false })
    }
}
export default ModelOptions