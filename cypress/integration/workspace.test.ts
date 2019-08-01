context("Test app workspace", () => {
  beforeEach(() => {
    cy.visit("");
  });

  describe("Code section", () => {
    it("renders with two code tabs", () => {
      cy.contains(".app",  "Blocks");
      cy.contains(".app",  "Code");
      // cy.get(".app").should("have.text", "Blocks");
    });
    it("Contains some town names in the blockly region", () => {
      cy.contains(".injectionDiv", "Boston");
    });
    it("cotains a command to set wind speed", () => {
      cy.contains(".injectionDiv", "wind");
    });
  });
});
