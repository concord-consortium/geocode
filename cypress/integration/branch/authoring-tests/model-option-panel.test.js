import ModelOptions from "../../../support/elements/ModelOptionPanel";

const modelOptions = new ModelOptions;

before(() => {
  cy.visit("");
});
describe('Model Option panel visibility',()=>{
  it('verify Options Menu panel shows',()=>{
    modelOptions.getModelOptionsMenu().click();
    modelOptions.getRequireEruptionOption().should('exist');
  })
  it('verify Option Menu closes',()=>{
    modelOptions.getModelOptionsMenu().click();
    modelOptions.getModelOptionsList().should('have.length',1);
  })
})
describe('Module option switches view',()=>{
  describe('Seismic module has correct options',()=>{
    it('verify Seismic model shows when selected',()=>{

    });
    it('verify correct model options are showing for Seismic',()=>{
      //Code toolbox should have Seismic option
      //Right Tab should still be visible but with changes:
      // Show Conditions shouls show Show Map
      // Show Monte Carlo should hsow Show Location over Time
      // Show Cross Section should not be visible
      //Require Eruption should not be visible
      //Require Painting should not be visible
      //Map Scenario should not be visible
      //Left Tabs additional options should be disabled
    })
  })

  it('verify Tephra model shows when selected',()=>{

  });
})

