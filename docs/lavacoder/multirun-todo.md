# LavaCoder Multirun — deferred cleanup

## Context

The LavaCoder **Data** tab has been replaced by a **Multirun** tab. The old per-flag
table (`Flag | Flag Name | Lava Impact? | Vog Impact?`) has been replaced by a per-run
table (`Run | Lava Thickness (m) | Eruption Volume (m³) | Total Area Covered (acres)`),
with one row appended each time a lava run completes.

**The old flag-table code is still present and still runs — it is simply no longer
rendered.** It was left in place deliberately: removing it reaches into the Blockly
toolbox and the default student programs, which are curriculum-facing and need a
content-design decision before they change.

This file is the checklist for ripping it out once that decision is made.

## Safe to remove

### Components / models
- `src/components/lava-coder/data-table.tsx` — whole file, no longer imported anywhere
- `src/components/lava-coder/data-table.scss` — whole file
- `src/models/data-table.ts` — `DataRow` / `DataTable`, used only by the above and the store

### Store — `src/stores/lava-simulation-store.ts`
- the `DataRow, DataTable, DataTableType` import
- the `dataTable` volatile property
- actions `addRowToTable()`, `clearDataTable()`, `newDataTable()`
- the `self.clearDataTable()` call inside `reset()`

### Interpreter — `src/blockly/interpreter.ts`
These exist only to populate table rows:
- `createTable` (also calls `uiStore.displayTable()`)
- `addRowToTable`
- `computeLava` — reads a row via `getRow()`
- `computeVog` — reads a row via `getRow()`
- `addData` — sets `row.displayData`
- the `getRow()` helper

### Blockly blocks — `src/blockly-blocks/lava/block-simulate-lava.ts`
- `molasses_create_table` (block def + `javascriptGenerator.forBlock` entry)
- `molasses_add_row` (block def + generator)
- `molasses_add_data` (block def + generator)

### Authoring XML
- `src/assets/blockly-authoring/toolbox/molasses-toolbox.xml` — 3 entries for the blocks above
- `src/assets/blockly-authoring/code/molasses-location.xml` — 5 occurrences; this is the
  default LavaCoder program, so removing them changes what students see on load
- `src/assets/blockly-authoring/code/molasses-vog.xml` — 0 occurrences, nothing to do

### Possibly dead afterwards
- `uiStore.displayTable()` (`src/stores/ui-store.ts`) — **still used.** The `createTable`
  block was its only caller, but the new `createMultirunTable` block calls it too, to bring
  the Multirun tab forward, so don't delete it with the rest.
  It hard-codes `setRightTabIndex(1)`. That is correct for LavaCoder today only because
  Cross-Section and Monte-Carlo are Tephra-only and `showConditions` defaults to true, making
  `kRightTabInfo.data.index` resolve to 1. An author who turns Conditions off would break it.
  The robust form is `kRightTabInfo.data.index`, but that would make a store import from
  `components/tabs`, so it was left alone.

## Do NOT remove

Flags are used well beyond the table — map markers, the lat/long popup and the vent key
all depend on them. Keep:
- `flagLocations` and `addFlagLocation` in the store and interpreter
- `molasses_set_flag_location` block
- `src/components/lava-coder/location-markers.ts`, `lat-long-popup.tsx`, `vent-key.tsx`
- `flagColors` / `flagLabels` / `maxFlags` in `lava-constants.ts`
- interpreter `lavaImpact` / `vogImpact` — these read the flag directly
  (`lavaDepthAtPoint`, `flag.vogConcentration`) and do **not** touch the table

## Test impact

These assert against the old table and will need updating or deleting:
- `cypress/support/elements/DataTab.js` — selector `.data-table`
- `cypress/e2e/branch/molasses.cy.js`
- `cypress/e2e/branch/data-panel.cy.js`
- `cypress/e2e/smoke/data-panel-ui.cy.js`

The `data-test` attributes are still `Data-tab` / `Data-panel`; they're generated without
the unit argument so only the visible label changed. Renaming them would also require
updating `cypress/support/elements/RightPanel.js`.

## Open design questions

1. **Clearing runs.** `clearMultirunTable()` exists but has no caller. `reset()` deliberately
   does not call it — `blocklyController.run()` resets before every run, so clearing there
   would wipe the history on each Run press. There is currently no way to clear the table
   short of reloading the page.
2. **Row source.** Rows are appended automatically on run completion. If the spec wants a
   Blockly block to control this instead, the hook is `completeSim()` in `runSimulation()`.
3. **Panel layout.** The Multirun tab still shows the globe above the table, inherited from
   the Data tab.
4. **Acres rounding.** `Math.round()`, matching the existing Total Area Covered box. Two
   close-but-different runs can display the same value.
