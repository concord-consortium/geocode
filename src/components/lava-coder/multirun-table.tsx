import { observer } from "mobx-react";
import { MultirunTableType, RunRowType } from "../../models/multirun-table";
import { lavaSimulation } from "../../stores/lava-simulation-store";

import "./multirun-table.scss";

interface IMultirunTableRowProps {
  row?: RunRowType;
  running?: boolean;
  selected?: boolean;
}
const MultirunTableRow = observer(function MultirunTableRow({ row, running, selected }: IMultirunTableRowProps) {
  if (!row) {
    // Placeholder row, shown before any run has completed. Not selectable.
    return (
      <tr>
        <td className="td-center" />
        <td className="td-center" />
        <td className="td-center" />
        <td className="td-center" />
      </tr>
    );
  }

  // Pickable only once its own run has finished AND the program has stopped.
  const selectable = row.complete && !running;
  // While the program runs, the erupting row stays at full strength as the selected one and the
  // rows already behind it dim, matching the Run toolbar.
  const dimmed = running && !selected;
  // Selecting is one-way: clicking the selected run again leaves it selected. Picking a
  // different run replaces it.
  const select = () => { if (selectable) lavaSimulation.setSelectedRunNumber(row.runNumber); };

  return (
    <tr
      className={
        `run-row${selected ? " selected" : ""}${dimmed ? " dimmed" : ""}${selectable ? "" : " not-selectable"}`
      }
      onClick={select}
    >
      <td className="td-center run-cell">
        {/* A real button so the row is reachable and toggleable by keyboard. aria-pressed rather
            than a grid role, because this table doesn't implement grid keyboard navigation. */}
        <button
          type="button"
          className="run-select-button"
          aria-pressed={!!selected}
          aria-label={`Show run ${row.runNumber} on the map`}
          disabled={!selectable}
          onClick={e => { e.stopPropagation(); select(); }}
        >
          {row.runNumber}
        </button>
      </td>
      <td className="td-center">{row.lavaThickness.toLocaleString()}</td>
      <td className="td-center">{row.eruptionVolume.toLocaleString()}</td>
      <td className="td-center">{Math.round(row.acresCovered).toLocaleString()}</td>
    </tr>
  );
});

interface IMultirunTableProps {
  multirunTable?: MultirunTableType;
  running?: boolean;
}
export const MultirunTable = observer(function MultirunTable({ multirunTable, running }: IMultirunTableProps) {
  if (!multirunTable) return null;

  const { selectedRunNumber } = lavaSimulation;

  return (
    <div className="multirun-table-container">
      <table className="multirun-table">
        <thead>
          <tr>
            <th className="run" scope="col">Run</th>
            <th className="thickness" scope="col">Lava Thickness (m)</th>
            <th className="volume" scope="col">Eruption Volume (m<sup>3</sup>)</th>
            <th className="area" scope="col">Total Area Covered (acres)</th>
          </tr>
        </thead>
        <tbody>
          {multirunTable.rows.length > 0
            ? multirunTable.rows.map(row => (
                <MultirunTableRow
                  key={row.runNumber}
                  row={row}
                  running={running}
                  selected={row.runNumber === selectedRunNumber}
                />
              ))
            : <MultirunTableRow />
          }
        </tbody>
      </table>
    </div>
  );
});
