class ModelOptions {
    getModelOptionsMenu(){
        return cy.get('.button .label-text').contains('Model options');
    }
    getModelOptionsList(){
        return cy.get('.dg.main li');
    }
    getRequireEruptionOption(){
        return cy.get('.label-text').contains('Require eruption?').siblings('input')
    }
    getRequirePaintingOption(){
        return cy.get('.label-text').contains('Require painting?').siblings('input')
    }
    selectMapScenario(scenario){
        cy.get('.select .label-text').contains('Map Scenario').siblings().select(scenario);
    }
    selectCodeToolbox(toolbox){
        cy.get('.select .label-text').contains('Code toolbox').siblings().select(toolbox);
    }
    selectInitialCode(codeType){
        cy.get('.label-text').contains('Initial code').siblings().select(codeType);
    }
    getShowBlocksOption(){
        return cy.get('.label-text').contains('Show blocks?').siblings('input')
    }
    getShowCodeOption(){
        return cy.get('.label-text').contains('Show code?').siblings('input')
    }
    getShowControlsOption(){
        return cy.get('.label-text').contains('Show controls?').siblings('input')
    }
    getShowConditionsOption(){
        return cy.get('.label-text').contains('Show conditions?').siblings('input')
    }
    getShowCrossSectionOption(){
        return cy.get('.label-text').contains('Show cross section?').siblings('input')
    }
    getShowDataOption(){
        return cy.get('.label-text').contains('Show data?').siblings('input')
    }
    getControlOptionFolderHeader(){
        return cy.get('li.folder .title').contains('Controls Options')
    }
    getShowWindSpeedOption(){
        return cy.get('.label-text').contains('Show Wind Speed?').siblings('input')
    }
    getShowWindDirectionOption(){
        return cy.get('.label-text').contains('Show Wind Direction?').siblings('input')
    }
    getShowEjectedVolumeOption(){
        return cy.get('.label-text').contains('Show Ejected Volume?').siblings('input')
    }
    getShowColumnHeightOption(){
        return cy.get('.label-text').contains('Show Column Height?').siblings('input')
    }
    getShowVEIOption(){
        return cy.get('.label-text').contains('Show VEI?').siblings('input')
    }
    getShowSpeedControl(){
        return cy.get('.label-text').contains('Show Speed Controls?').siblings('input')
    }
    getShowBarHistogram(){
        return cy.get('.label-text').contains('Show Bar Histogram?').siblings('input')
    }
    getShowLogOption(){
        return cy.get('.label-text').contains('Show Log?').siblings('input')
    }
    getShowDemoChartsOption(){
        return cy.get('.label-text').contains('Show Demo Charts?').siblings('input')
    }
    saveCurrentState(){
        return cy.get('.label-text').contains('Save current state to local storage')
    }
    restoreSavedState(){
        return cy.get('.label-text').contains('Load state from local storage')
    }
}
export default ModelOptions