import { observer } from "mobx-react";
import { DataRowType, DataTableType } from "../../models/data-table";

import "./data-table.scss";

interface IDataTableRowProps {
  row?: DataRowType;
}
function DataTableRow({ row }: IDataTableRowProps) {
  const latLong = row ? `${row.latitude ?? ""}, ${row.longitude ?? ""}` : "";
  const lavaImpact = row ? "No" : "";

  return (
    <tr>
      <td>{row?.label ?? ""}</td>
      <td>{row?.name ?? ""}</td>
      <td>{latLong}</td>
      <td>{lavaImpact}</td>
    </tr>
  );
}

interface IDataTableProps {
  dataTable?: DataTableType;
}
export const DataTable = observer(function DataTable({ dataTable }: IDataTableProps) {
  if (!dataTable) return null;

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th className="flag">Flag</th>
            <th className="name">Flag Name</th>
            <th className="lat-long">Lat/Long</th>
            <th className="lava">Lava Impact?</th>
          </tr>
        </thead>
        <tbody>
          {dataTable.rows.length > 0
            ? dataTable.rows.map(row => <DataTableRow key={row.label} row={row} />)
            : <DataTableRow />
          }
        </tbody>
      </table>
    </div>
  );
});
