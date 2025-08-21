import { types } from "mobx-state-tree";

const DataRow = types.model("DataRow", {
  color: types.string,
  label: types.string,
  latitude: types.number,
  longitude: types.number,
  name: types.string,
});

export type DataRowType = typeof DataRow.Type;

export const DataTable = types.model("DataTable", {
  rows: types.optional(types.array(DataRow), [])
})
.actions(self => {
  return {
    addRow(row: DataRowType) {
      self.rows.push(row);
    },
    clearRows() {
      self.rows.clear();
    }
  };
});

export type DataTableType = typeof DataTable.Type;
