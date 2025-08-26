
import BlocksTab from "../../support/elements/BlocksTab";
import ModelOptions from "../../support/elements/ModelOptionPanel";

const blocksTab = new BlocksTab();
const modelOptions = new ModelOptions();

// need to convert Blockly strings because they have &nbsp; in the DOM
// but when run thru Cypress, Cypress converts it so `contain` never matches
// function removeNBSP(text){
//     const re = new RegExp(String.fromCharCode(160), "g");
//     return text.replace(re, " ");
// }

context("Molasses Simulation", () => {
  beforeEach(() => {
    cy.visit("");
    modelOptions.getModelOptionsMenu().click();
    modelOptions.selectUnitOption('LavaCoder');
    modelOptions.selectInitialCode('Molasses Location');
    modelOptions.getModelOptionsMenu().click();
  });

  describe('blocks', () => {
    it('verify correct blocks are present', () => {
      blocksTab.getTag('Volcano').should('be.visible');
      blocksTab.getTag('Logic').should('be.visible');
      blocksTab.getTag('Loops').should('be.visible');
      blocksTab.getTag('Data').should('be.visible');
      blocksTab.getTag('Variables').should('be.visible');
      blocksTab.getTag('Functions').should('be.visible');

      blocksTab.getTag('Volcano').click();
      blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 7);
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).should('have.length', 17);
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl())
        .contains("Compute and visualize lava flow with...").should("exist");
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).contains("Set eruption volume").should("exist");
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).contains("Set lava front height").should("exist");
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).contains("Set vent location").should("exist");
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).contains("Set flag location").should("exist");
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).contains("Compute lava flow impact").should("exist");
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).contains("Add data from flag").should("exist");

    //   blocksTab.getTag('Data').click();
    //   blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 7);
    //   blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).should('have.length', 13);
    //   blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(0).text().then((text) => {
    //       expect(removeNBSP(text)).to.containIgnoreCase("Name");
    //   });
    //   blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(1).text().then((text) => {
    //       expect(removeNBSP(text)).to.containIgnoreCase("4");
    //   });
    //   blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(2).text().then((text) => {
    //       expect(removeNBSP(text)).to.containIgnoreCase("Range from");
    //   });
    //   blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(6).text().then((text) => {
    //       expect(removeNBSP(text)).to.containIgnoreCase("Latitude, Longitude");
    //   });
    //   blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(8).text().then((text) => {
    //       expect(removeNBSP(text)).to.containIgnoreCase("+");
    //   });
    //   blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(9).text().then((text) => {
    //       expect(removeNBSP(text)).to.containIgnoreCase("Create a data table");
    //   });
    //   blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(10).text().then((text) => {
    //       expect(removeNBSP(text)).to.containIgnoreCase("Create row in data table");
    //   });
    });
  });
});
