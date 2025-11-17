import { types } from "mobx-state-tree";

export const DataRow = types.model("DataRow", {
  color: types.string,
  displayData: types.optional(types.boolean, false),
  label: types.string,
  latitude: types.number,
  lavaDepth: types.maybe(types.number),
  longitude: types.number,
  name: types.string,
  vogConcentration: types.maybe(types.number)
})
.actions(self => ({
  setDisplayData(display: boolean) {
    self.displayData = display;
  },
  setLavaDepth(depth: number) {
    self.lavaDepth = depth;
  },
  setVogConcentration(concentration: number) {
    self.vogConcentration = concentration;
  }
}));

export type DataRowType = typeof DataRow.Type;

export const DataTable = types.model("DataTable", {
  rows: types.optional(types.array(DataRow), [])
})
.actions(self => ({
  addRow(row: DataRowType) {
    self.rows.push(row);
  },
  clearRows() {
    self.rows.clear();
  }
}));

export type DataTableType = typeof DataTable.Type;
