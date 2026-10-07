import { observer } from "mobx-react";
import { lavaSimulation } from "../../stores/lava-simulation-store";

import "./run-toolbar.scss";

/**
 * Floating map control listing the completed runs. Clicking a circle does the same thing as
 * selecting that row in the Multirun table — it displays that run's lava footprint.
 * Builds up one circle per run, so it shows nothing until the first run completes.
 */
interface IProps {
  /** True while the Blockly program is running. Circles aren't selectable mid-program. */
  running: boolean;
}

export const RunToolbar = observer(function RunToolbar({ running }: IProps) {
  const { multirunTable, selectedRunNumber } = lavaSimulation;
  // No table until the program creates one, and no toolbar until it has a run in it.
  const rows = multirunTable?.rows;

  if (!rows || rows.length === 0) return null;

  return (
    <div className="run-toolbar-band">
      <div className="run-toolbar">
        <div className="run-toolbar-label">Run</div>
        <div className="run-toolbar-circles">
          {rows.map(row => {
            const selected = row.runNumber === selectedRunNumber;
            // Clickable only once its own run has finished AND the program has stopped.
            const selectable = row.complete && !running;
            // While the program runs, the erupting circle is the selected one at full strength
            // and the runs already behind it take the map buttons' disabled treatment. Once the
            // program stops they all come back up and become selectable.
            const dimmed = running && !selected;
            return (
              <button
                key={row.runNumber}
                type="button"
                className={`run-circle${selected ? " selected" : ""}${dimmed ? " dimmed" : ""}`}
                aria-pressed={selected}
                aria-label={`Show run ${row.runNumber} on the map`}
                disabled={!selectable}
                onClick={() => lavaSimulation.setSelectedRunNumber(row.runNumber)}
              >
                <span className="run-number">{row.runNumber}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
