import ModelOptions from "../../support/elements/ModelOptionPanel";
import LeftPanel from "../../support/elements/LeftPanel"
import CodeTab from "../../support/elements/CodeTab"

const modelOptions = new ModelOptions;
const leftPanel = new LeftPanel;
const codeTab = new CodeTab;

context("Code panel", () => {
    before(() => {
      cy.visit("");
      modelOptions.getModelOptionsMenu().click();
      modelOptions.getShowCodeOption().click();
      modelOptions.getModelOptionsMenu().click();

      leftPanel.getCodeTab().should('be.visible').click();
    });

    describe("Code panel ui", () => {
      it('verify Code tab shows correct elements',()=>{
        codeTab.getCodePanel().should('be.visible');
      })
    });
  });