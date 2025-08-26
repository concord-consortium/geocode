import { types } from "mobx-state-tree";

export const DataRow = types.model("DataRow", {
  color: types.string,
  label: types.string,
  lavaDepth: types.maybe(types.number),
  name: types.string,
})
.actions(self => ({
  setLavaDepth(depth: number) {
    self.lavaDepth = depth;
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
