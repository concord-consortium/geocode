import LeftPanel from "../../support/elements/LeftPanel"
import CodeTab from "../../support/elements/CodeTab"

const leftPanel = new LeftPanel;
const codeTab = new CodeTab;

context("Code panel", () => {
    before(() => {
      cy.visit("");
      leftPanel.getCodeTab().should('be.visible').click();
    });
  
    describe("Code panel ui", () => {
      it('verify Code tab shows correct elements',()=>{
        codeTab.getCodePanel().should('be.visible');
      })
    });
  });