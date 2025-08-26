
import BlocksTab from "../../support/elements/BlocksTab";
import ModelOptions from "../../support/elements/ModelOptionPanel";

const blocksTab = new BlocksTab();
const modelOptions = new ModelOptions();

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

      blocksTab.getTag('Data').click();
      blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 7);
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).should('have.length', 13);
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).contains("Name").should("exist");
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).contains("4").should("exist");
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).contains("Range from").should("exist");
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).contains("Latitude, Longitude").should("exist");
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).contains("+").should("exist");
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).contains("Create a data table").should("exist");
      blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).contains("Create row in data table").should("exist");
    });
  });
});
