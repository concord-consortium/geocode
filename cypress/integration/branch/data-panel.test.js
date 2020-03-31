import RightPanel from "../../support/elements/RightPanel";
import BlocksTab from "../../support/elements/BlocksTab";
import ModelOptions from "../../support/elements/ModelOptionPanel";
import DataTab from "../../support/elements/DataTab";

const rightPanel = new RightPanel;
const blocksTab = new BlocksTab;
const modelOptions = new ModelOptions;
const dataTab = new DataTab

before(() => {
    cy.visit("");
    modelOptions.getModelOptionsMenu().click();
    modelOptions.selectInitialCode('Wind Data Collection');
    modelOptions.getShowSpeedControl().click();
    modelOptions.getModelOptionsMenu().click();
    blocksTab.setSpeedControl("fast")
    blocksTab.runProgram();
    cy.wait(2000)
    rightPanel.getDataTab().click();
  });

  context('Data Tab',()=>{
      describe('Wind speed and direction graphs',()=>{
          it('verify wind data graph is visible',()=>{
            cy.get('[data-test=data-chart-scatter]').eq(0).matchImageSnapshot('Chart 1')
          })
          it('verify wind speed and direction graph is visible',()=>{
            cy.get('[data-test=data-chart-radial]').scrollIntoView();
            cy.get('[data-test=data-chart-radial]').eq(0).matchImageSnapshot('Chart 2')
          })
          it('verify Wind Data speed v elevation',()=>{
            cy.get('[data-test=data-chart-scatter]').eq(1).scrollIntoView().wait(1000).matchImageSnapshot('Chart 3', { capture: 'fullPage' })
            // cy.get('[data-test=data-chart-scatter]').eq(1)
          })
      })
  })