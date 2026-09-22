import { BlocklyAuthoring } from "../assets/blockly-authoring";
import { queryValue, queryValueBoolean } from "../utilities/url-query";
import { blocklyStore } from "./blockly-store";
import { uiStore } from "./ui-store";
import { unitStore } from "./unit-store";
import { applyUrlSettings } from "./url-settings";

// url-query wraps query-string, which is esm-only and so can't be loaded by jest. We stub the two
// functions that read the url, which also lets each test set up the url parameters it needs.
jest.mock("../utilities/url-query", () => ({
  queryValue: jest.fn(),
  queryValueBoolean: jest.fn()
}));

const setUrlParams = ({ unit, hideModelOptions }: { unit?: string, hideModelOptions?: boolean }) => {
  (queryValue as jest.Mock).mockImplementation((prop: string) => prop === "unit" ? unit : undefined);
  (queryValueBoolean as jest.Mock).mockImplementation(
    (prop: string) => prop === "hide-model-options" ? !!hideModelOptions : false);
};

describe("applyUrlSettings", () => {
  beforeEach(() => {
    setUrlParams({});
    unitStore.setUnit("Tephra");
    blocklyStore.setToolbox("Everything");
    uiStore.setShowOptionsDialog(true);
  });

  it("selects the unit and its default toolbox named by the unit parameter", () => {
    setUrlParams({ unit: "LavaCoder" });

    applyUrlSettings();

    expect(unitStore.name).toBe("LavaCoder");
    expect(blocklyStore.toolbox).toBe(BlocklyAuthoring.molassesToolboxes[0]);
  });

  it("selects the Seismic unit and its default toolbox", () => {
    setUrlParams({ unit: "Seismic" });

    applyUrlSettings();

    expect(unitStore.name).toBe("Seismic");
    expect(blocklyStore.toolbox).toBe(BlocklyAuthoring.seismicToolboxes[0]);
  });

  it("leaves the unit and toolbox alone when there is no unit parameter", () => {
    // a unit other than the store's default, so this asserts more than the default
    unitStore.setUnit("LavaCoder");

    applyUrlSettings();

    expect(unitStore.name).toBe("LavaCoder");
    expect(blocklyStore.toolbox).toBe("Everything");
  });

  it("hides the model options for the Tephra unit, which has no authorable options", () => {
    setUrlParams({ unit: "Tephra" });

    applyUrlSettings(true);

    expect(uiStore.showOptionsDialog).toBe(false);
  });

  it("hides the model options for the Seismic unit, which has no authorable options", () => {
    setUrlParams({ unit: "Seismic" });

    applyUrlSettings(true);

    expect(uiStore.showOptionsDialog).toBe(false);
  });

  it("shows the model options for the LavaCoder unit", () => {
    setUrlParams({ unit: "LavaCoder" });
    uiStore.setShowOptionsDialog(false);

    applyUrlSettings(true);

    expect(uiStore.showOptionsDialog).toBe(true);
  });

  it("hides the model options when the hide-model-options parameter is set", () => {
    setUrlParams({ unit: "LavaCoder", hideModelOptions: true });

    applyUrlSettings(true);

    expect(uiStore.showOptionsDialog).toBe(false);
  });

  // The model options dialog is also hidden when the app is embedded in LARA as a student or in a
  // report, which the url says nothing about. Reloading the model reapplies the url settings, and
  // has to leave the dialog alone, or it would reveal a dialog that LARA had hidden.
  it("doesn't touch the model options dialog unless asked to apply it", () => {
    setUrlParams({ unit: "LavaCoder" });   // a unit whose url settings would show the dialog
    uiStore.setShowOptionsDialog(false);

    applyUrlSettings();

    expect(uiStore.showOptionsDialog).toBe(false);
  });
});
