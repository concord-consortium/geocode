import BlocksTab from "../../support/elements/BlocksTab";
import CodeTab from "../../support/elements/CodeTab";
import LeftPanel from "../../support/elements/LeftPanel";

const leftPanel = new LeftPanel;
const blocksTab = new BlocksTab;
const codeTab = new CodeTab;

before(() => {
    cy.visit("");
    leftPanel.getBlocksTab().should('be.visible').click();
  });

context('Data blocks in code',()=>{
    it('verify add text block adds text in Code panel',()=>{
        blocksTab.getTag('Data').click();
        cy.get('.blocklyBlockCanvas').within(($canvas)=>{
            blocksTab.getTextBlock().contains('Name').click();
        });
        leftPanel.getCodeTab().click();
        codeTab.getCodePanel().should('contain','Name')
    })
    it('verify edit text block edits Code panel',()=>{
        var text='Berkeley'
        leftPanel.getBlocksTab().click();
        blocksTab.getTextBlock().eq(0).click().then(()=>{
            blocksTab.editText(text)
        })    
        leftPanel.getCodeTab().click();
        codeTab.getCodePanel().should('contain',text)
    })
    it('verify add number block adds number in Code panel',()=>{
        leftPanel.getBlocksTab().click();
        blocksTab.getTag('Data').click();
        cy.get('.blocklyBlockCanvas').within(($canvas)=>{
            blocksTab.getTextBlock().contains('4').click();
        });
        leftPanel.getCodeTab().click();
        codeTab.getCodePanel().should('contain','4')
    })
    it('verify edit number edits Code Panel',()=>{
        var num='9'
        leftPanel.getBlocksTab().click();
        blocksTab.getTextBlock().eq(1).click().then(()=>{
            blocksTab.editText(num)
        })    
        leftPanel.getCodeTab().click();
        codeTab.getCodePanel().should('contain',num)
    })
    it('verify number block disallows text entry',()=>{
        var text='pool',num=9;
        leftPanel.getBlocksTab().click();
        blocksTab.getTextBlock().eq(1).click({force:true}).then(()=>{
            blocksTab.editText(text)
        })    
        leftPanel.getCodeTab().click();
        codeTab.getCodePanel().should('contain',num)
    })
})