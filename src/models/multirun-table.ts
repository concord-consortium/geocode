import { types } from "mobx-state-tree";

/**
 * A single completed run of the lava simulation, as displayed in the Multirun table.
 * The two parameter columns are captured at the moment the run completes, so that
 * changing the parameters for the next run doesn't rewrite the history.
 */
export const RunRow = types.model("RunRow", {
  runNumber: types.number,
  lavaThickness: types.number,
  eruptionVolume: types.number,
  // Grows while the run is in progress; final once `complete` is set.
  acresCovered: types.number,
  // A row is added when its run starts, so it exists before its results do. Until the run
  // finishes there is no stored footprint, so the row and its toolbar circle aren't selectable.
  complete: types.optional(types.boolean, false)
})
.actions(self => ({
  setAcresCovered(acres: number) {
    self.acresCovered = acres;
  },
  setComplete(complete: boolean) {
    self.complete = complete;
  }
}));

export type RunRowType = typeof RunRow.Type;

export const MultirunTable = types.model("MultirunTable", {
  rows: types.optional(types.array(RunRow), [])
})
.views(self => ({
  get nextRunNumber() {
    return self.rows.length + 1;
  },
  row(runNumber: number) {
    return self.rows.find(row => row.runNumber === runNumber);
  }
}))
.actions(self => ({
  addRow(row: RunRowType) {
    self.rows.push(row);
  }
}));

export type MultirunTableType = typeof MultirunTable.Type;
