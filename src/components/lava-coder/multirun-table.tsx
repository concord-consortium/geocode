import { observer } from "mobx-react";
import { useEffect, useRef } from "react";
import { MultirunTableType, RunRowType } from "../../models/multirun-table";
import { lavaSimulation } from "../../stores/lava-simulation-store";

import "./multirun-table.scss";

// Animating is a nicety, so it gives way to a reduced-motion preference.
const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

interface IMultirunTableRowProps {
  row: RunRowType;
  running?: boolean;
  selected?: boolean;
}
// A row only exists once its run has started, so there is never an empty placeholder — the
// first row appears as it fills, exactly like every row after it.
const MultirunTableRow = observer(function MultirunTableRow({ row, running, selected }: IMultirunTableRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null);
  // Pickable only once its own run has finished AND the program has stopped.
  const selectable = row.complete && !running;
  // While the program runs, the erupting row stays at full strength as the selected one and the
  // rows already behind it dim, matching the Run toolbar.
  const dimmed = running && !selected;
  // Selecting is one-way: clicking the selected run again leaves it selected. Picking a
  // different run replaces it.
  const select = () => {
    if (!selectable) return;
    lavaSimulation.setSelectedRunNumber(row.runNumber);
    // A row can be half out of view when it's clicked. "nearest" scrolls the least amount
    // needed, so a fully visible row doesn't move at all.
    rowRef.current?.scrollIntoView({ block: "nearest", behavior: scrollBehavior() });
  };

  return (
    <tr
      ref={rowRef}
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
  // tbody is the scrolling element, so the header stays put and the scrollbar covers only
  // the rows.
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const rowCount = multirunTable?.rows.length ?? 0;
  const previousRowCount = useRef<number | null>(null);

  // Keep the newest run in view. A row is added as its run starts, so once there are more runs
  // than fit, this follows the eruption instead of leaving it below the fold. Hooks run before
  // the empty-state return below, as the rules of hooks require.
  useEffect(() => {
    const body = bodyRef.current;
    const previous = previousRowCount.current;
    previousRowCount.current = rowCount;

    // Only follow a run that has just been added. previous === null means this is the first
    // render, which happens every time the Multirun tab is reselected — the right-hand
    // TabPanels don't set forceRender, so the table unmounts and remounts on every tab
    // switch. Scrolling then would yank the user to the bottom for no reason.
    if (!body || previous === null || rowCount <= previous) return;
    // Animating is a nicety, so it gives way to a reduced-motion preference. When the table
    // isn't overflowing, scrollHeight equals clientHeight and this is a no-op either way.
    body.scrollTo({ top: body.scrollHeight, behavior: scrollBehavior() });
  }, [rowCount]);

  // Before a program runs its "Create a multirun data table" block there is no table at all.
  // Say why, rather than leaving the panel blank with no explanation.
  if (!multirunTable) {
    return (
      <div className="multirun-table-container">
        <div className="multirun-empty-state">
          <div className="multirun-empty-title">No data yet</div>
          <div className="multirun-empty-detail">
            Add a {"\u201C"}Create a multirun data table{"\u201D"} block to the top of your program.
            Run your program to collect your data.
          </div>
        </div>
      </div>
    );
  }

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
        <tbody data-test="multirun-table-body" ref={bodyRef}>
          {multirunTable.rows.map(row => (
            <MultirunTableRow
              key={row.runNumber}
              row={row}
              running={running}
              selected={row.runNumber === selectedRunNumber}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});
