import RightPanel from "../../support/elements/RightPanel";
import BlocksTab from "../../support/elements/BlocksTab";
import ModelOptions from "../../support/elements/ModelOptionPanel";
import DataTab from "../../support/elements/DataTab";

const rightPanel = new RightPanel;
const blocksTab = new BlocksTab;
const modelOptions = new ModelOptions;
const dataTab = new DataTab;

  context('Data Tab',()=>{
    before(() => {
      cy.visit("");
      modelOptions.getModelOptionsMenu().click();
      modelOptions.selectInitialCode('Wind Data Collection');
      modelOptions.getShowSpeedControl().click();
      modelOptions.getModelOptionsMenu().click();
      blocksTab.setSpeedControl("fast");
      blocksTab.runProgram();
      cy.wait(2000);
      rightPanel.getDataTab().click();
    });
      describe('Wind speed and direction graphs',()=>{
          it.skip('verify wind data graph and wind speed and direction graph are visible',()=>{ //Need to do this at the same time bec. snapshot does not work
            cy.get('[data-test=data-chart-scatter]').parent().parent().scrollTo('top');
            dataTab.getDataPanel().matchImageSnapshot('Chart 1');
          });
      });
      describe('Direction v elevation graph',()=>{ //had to make this separate because of scrolling issues for three graphs
        before(() => {
          modelOptions.getModelOptionsMenu().click();
          modelOptions.selectInitialCode('Filtered Wind Data Collection');
          modelOptions.getModelOptionsMenu().click();
          blocksTab.runProgram();
          cy.wait(2000);
          rightPanel.getDataTab().click();
        });
        it('verify direction v elevation graph is visible',()=>{
          cy.get('[data-test=data-chart-scatter]').should('exist');
        });
        it.skip('verify direction v elevation graph matches the image',()=>{
          cy.get('[data-test=data-chart-scatter]').eq(0).matchImageSnapshot('Chart 3');
        });
    });
  });
