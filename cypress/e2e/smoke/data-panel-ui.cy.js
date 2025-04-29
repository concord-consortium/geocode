import RightPanel from "../../support/elements/RightPanel";
import DataTab from "../../support/elements/DataTab";

const rightPanel = new RightPanel;
const dataTab = new DataTab;

context("Data panel", () => {
    before(() => {
      cy.visit("");
      rightPanel.getDataTab().should('be.visible').click();
    });
  
    describe("data panel ui", () => {
        it('verify data tab shows correct elements',()=>{
            dataTab.getDataPanel().should('be.visible');
        });
    });
});
