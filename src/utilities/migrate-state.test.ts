import testMigrations from "./../assets/test/test-serialization.json";
import { migrate } from "./migrate-state";

describe("stores", () => {
  it("we can migrate old state to the most recent state", () => {
    for (const test of testMigrations.tests) {
      const migratedState = migrate(test.oldState);
      expect(migratedState).toEqual(test.expectedConvertedState);
    }
  });
});
