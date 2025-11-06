import { observer } from "mobx-react";
import { DataRowType, DataTableType } from "../../models/data-table";
import { flagColorInfo } from "../../simulations/lava-coder/lava-constants";
import { getLocationMarkerSvg } from "./location-markers";

import "./data-table.scss";

interface IDataTableRowProps {
  row?: DataRowType;
}
const DataTableRow = observer(function DataTableRow({ row }: IDataTableRowProps) {
  const color = row ? flagColorInfo[row.color ?? ""]?.color ?? "#000" : "#000";
  const label = row?.label ?? "";
  const lavaImpact = row?.displayLava && row.lavaDepth != null
    ? row.lavaDepth > 0 ? "Yes" : "No"
    : "";

  return (
    <tr>
      <td className="td-center">
        {row && (
          <div className="location-marker-container">
            <img src={getLocationMarkerSvg(color)} alt={label} />
            <div className="location-marker-label">{label}</div>
          </div>
        )}
      </td>
      <td className="td-left">{row?.name ?? ""}</td>
      <td className="td-center">{lavaImpact}</td>
    </tr>
  );
});

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
