import { LavaMapTypes, uiStore } from "./ui-store";

// url-query wraps query-string, which is esm-only and so can't be loaded by jest
jest.mock("../utilities/url-query", () => ({
  queryValue: jest.fn(),
  queryValueBoolean: jest.fn(() => false)
}));

describe("map types", () => {
  it("offers the self-hosted imagery as Terrain", () => {
    expect(LavaMapTypes).toContain("terrain");
    expect(LavaMapTypes).not.toContain("vivid");
  });

  it("loads a saved Terrain map type as the self-hosted Terrain imagery", () => {
    uiStore.loadAuthorSettingsData({ mapType: "terrain" });
    expect(uiStore.mapType).toBe("terrain");
  });

  it("loads a saved state from when the map type was called Vivid as Terrain", () => {
    uiStore.loadAuthorSettingsData({ mapType: "vivid" });
    expect(uiStore.mapType).toBe("terrain");
  });

  it("keeps a saved map type that still exists", () => {
    uiStore.loadAuthorSettingsData({ mapType: "street" });
    expect(uiStore.mapType).toBe("street");
  });
});
