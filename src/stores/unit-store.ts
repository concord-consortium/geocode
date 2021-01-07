/**
 * This just holds a single prop, but by making it a store we get MST observations.
 * This could eventually hold more top-level props
 */

import { types } from "mobx-state-tree";

export const UnitName = types.enumeration("type", ["Tephra", "Seismic"]);
export type UnitNameType = typeof UnitName.Type;

export const UnitStore = types
  .model("unit", {
    name: UnitName
  })
  .actions((self) => ({
    setUnit(name: UnitNameType) {   // if we add more props, we will want loadAuthorSettingsData instead
      self.name = name;
    }
  }));

export const unitStore = UnitStore.create({ name: "Tephra" });

export type UnitStoreType = typeof UnitStore.Type;
