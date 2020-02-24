class ModelOptions {
    getModelOptionsMenu(){
        return cy.get('.button .label-text').contains('Model options');
    }
    getRequireEruption(){
        return cy.get('.label-text').contains('Require eruption?')
    }
    getRequirePainting(){
        return cy.get('.label-text').contains('Require painting?')
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

    }
    getShowCodeOption(){

    }
    getShowControlsOption(){

    }
    getShowConditionsOption(){

    }
    getShowCrossSectionOption(){

    }
    getShowDataOption(){

    }
    getShowLogOption(){

    }
    saveCurrentState(){

    }
    restoreSavedState(){

    }
}
export default ModelOptions