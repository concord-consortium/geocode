import ModelOptions from "../../support/elements/ModelOptionPanel";
import BlocksTab from "../../support/elements/BlocksTab";
import CodeTab from "../../support/elements/CodeTab";
import LeftPanel from "../../support/elements/LeftPanel";

const modelOptions = new ModelOptions;
const leftPanel = new LeftPanel;
const blocksTab = new BlocksTab;
const codeTab = new CodeTab;

const DataRegEx = /Data$/gm;        // regex to ignore "Data Samples"

beforeEach(() => {
    cy.visit("");
    // show code tab
    modelOptions.getModelOptionsMenu().click();
    modelOptions.getShowCodeOption().click();
    modelOptions.getModelOptionsMenu().click();

    leftPanel.getBlocksTab().should('be.visible').click();
    blocksTab.getTag(DataRegEx).click();
});

context('Data blocks in code',()=>{
    it('verify add text block adds text in Code panel',()=>{
        blocksTab.getTextBlock().contains('Name').click();
        leftPanel.getCodeTab().click();
        codeTab.getCodePanel().should('contain','Name');
    });
    it('verify edit text block edits Code panel',()=>{
        const text='Berkeley';
        blocksTab.getTextBlock().eq(0).click();
        blocksTab.editText(text);
        leftPanel.getCodeTab().click();
        codeTab.getCodePanel().should('contain',text);
    });
    it('verify add number block adds number in Code panel',()=>{
        blocksTab.getTextBlock().contains('4').click();
        leftPanel.getCodeTab().click();
        codeTab.getCodePanel().should('contain','4');
    });
    it('verify edit number edits Code Panel',()=>{
        const num='9';
        blocksTab.getTextBlock().eq(1).click();
        blocksTab.editText(num);
        leftPanel.getCodeTab().click();
        codeTab.getCodePanel().should('contain',num);
    });
    it('verify number block disallows text entry',()=>{
        const text='pool',num='4';
        blocksTab.getTextBlock().eq(1).click();
        blocksTab.editText(text);
        blocksTab.getTextBlock().should('contain.text', num);
        leftPanel.getCodeTab().click();
        codeTab.getCodePanel().should('contain',num);
    });
});
