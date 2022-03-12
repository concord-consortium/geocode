class ModelOptions {
    getModelOptionsMenu(){
        return cy.get('.button .label-text').contains('Model options', { matchCase: false });
    }
    getModelOptionsList(){
        return cy.get('.dg.main li');
    }
    getRequireEruptionOption(){
        return cy.get('.label-text').contains('Require eruption?').siblings('.checkbox-container').find('input')
    }
    getRequirePaintingOption(){
        return cy.get('.label-text').contains('Require painting?').siblings('.checkbox-container').find('input')
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
        return cy.get('.label-text').contains('Show blocks?').siblings('.checkbox-container').find('input')
    }
    getShowCodeOption(){
        return cy.get('.label-text').contains('Show code?').siblings('.checkbox-container').find('input')
    }
    getShowControlsOption(){
        return cy.get('.label-text').contains('Show controls?').siblings('.checkbox-container').find('input')
    }
    getShowConditionsOption(){
        return cy.get('.label-text').contains('Show conditions?').siblings('.checkbox-container').find('input')
    }
    getShowCrossSectionOption(){
        return cy.get('.label-text').contains('Show cross section?').siblings('.checkbox-container').find('input')
    }
    getShowDataOption(){
        return cy.get('.label-text').contains('Show data?').siblings('.checkbox-container').find('input')
    }
    getControlOptionFolderHeader(){
        return cy.get('li.folder .title').contains('Controls Options')
    }
    getShowWindSpeedOption(){
        return cy.get('.label-text').contains('Show Wind Speed?').siblings('.checkbox-container').find('input')
    }
    getShowWindDirectionOption(){
        return cy.get('.label-text').contains('Show Wind Direction?').siblings('.checkbox-container').find('input')
    }
    getShowEjectedVolumeOption(){
        return cy.get('.label-text').contains('Show Ejected Volume?').siblings('.checkbox-container').find('input')
    }
    getShowColumnHeightOption(){
        return cy.get('.label-text').contains('Show Column Height?').siblings('.checkbox-container').find('input')
    }
    getShowVEIOption(){
        return cy.get('.label-text').contains('Show VEI?').siblings('.checkbox-container').find('input')
    }
    getShowSpeedControl(){
        return cy.get('.label-text').contains('Show Speed Controls?').siblings('.checkbox-container').find('input')
    }
    getShowBarHistogram(){
        return cy.get('.label-text').contains('Show Bar Histogram?').siblings('.checkbox-container').find('input')
    }
    getShowLogOption(){
        return cy.get('.label-text').contains('Show Log?').siblings('.checkbox-container').find('input')
    }
    getShowDemoChartsOption(){
        return cy.get('.label-text').contains('Show Demo Charts?').siblings('.checkbox-container').find('input')
    }
    getShowRiskDiamondsOption(){
        return cy.get('.label-text').contains('Show Risk Diamonds?').siblings('.checkbox-container').find('input')
    }
    saveCurrentState(){
        return cy.get('.label-text').contains('Save current state to local storage')
    }
    restoreSavedState(){
        return cy.get('.label-text').contains('Load state from local storage')
    }
}
export default ModelOptions
