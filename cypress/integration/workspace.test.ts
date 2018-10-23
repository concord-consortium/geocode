context("Test the overall app", () => {
  before(() => {
    cy.visit("");
  });

  describe("Desktop functionalities", () => {
    it("renders with text", () => {
      cy.get(".app").should("have.text", "Hello World");
    });
  });
});
