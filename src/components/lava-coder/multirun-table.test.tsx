// Both stubs exist because the real modules are ESM that jest can't parse. @cesium/engine is
// reached via the lava simulation store; url-query (which wraps query-string) via ui-store.
// url-settings.test.ts stubs url-query for the same reason.
jest.mock("@cesium/engine", () => ({
  KmlDataSource: class {},
  Math: { toRadians: (degrees: number) => degrees * 3.141592653589793 / 180 }
}));
// The repo's jest moduleNameMapper covers css|less|sass but not scss, so a component that
// imports a stylesheet can't be loaded. Stubbed here rather than changing the shared config.
jest.mock("./multirun-table.scss", () => ({}));
jest.mock("../../utilities/url-query", () => ({
  queryValue: jest.fn(),
  queryValueBoolean: jest.fn(),
  setQueryValue: jest.fn()
}));

import { configure, fireEvent, render, screen, within } from "@testing-library/react";
import { MultirunTable as MultirunTableModel, MultirunTableType, RunRow } from "../../models/multirun-table";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import { MultirunTable } from "./multirun-table";

// The repo marks elements with data-test rather than data-testid.
configure({ testIdAttribute: "data-test" });

const addRun = (table: MultirunTableType, runNumber: number, overrides = {}) => {
  table.addRow(RunRow.create({
    runNumber,
    lavaThickness: 10,
    eruptionVolume: 200000000,
    acresCovered: 0,
    ...overrides
  }));
  return table.row(runNumber)!;
};

// Finds a run's row by the accessible name of its select button, using only Testing Library
// queries (no closest()/parentNode walking).
const rowFor = (runNumber: number) =>
  screen.getAllByRole("row").find(row =>
    within(row).queryByRole("button", { name: `Show run ${runNumber} on the map` })
  )!;

describe("MultirunTable component", () => {
  let table: MultirunTableType;

  beforeEach(() => {
    table = MultirunTableModel.create();
    lavaSimulation.setSelectedRunNumber(undefined);
    // Every render runs the scroll effect, and jsdom implements neither Element.scrollTo nor
    // matchMedia. Stub both for the whole file; the scrolling tests below refine them.
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: jest.fn(function (this: HTMLElement, options: ScrollToOptions) {
        this.scrollTop = options.top ?? 0;
      })
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({ matches: false })
    });
    // jsdom doesn't implement scrollIntoView either; clicking a row calls it.
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: jest.fn()
    });
  });

  it("explains why the panel is blank before a program creates a table", () => {
    render(<MultirunTable multirunTable={undefined} />);

    expect(screen.getByText("No data yet")).toBeInTheDocument();
    expect(screen.getByText(/Create a multirun data table/)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows the column headers once a table exists, even with no runs", () => {
    render(<MultirunTable multirunTable={table} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Run")).toBeInTheDocument();
    expect(screen.getByText("Lava Thickness (m)")).toBeInTheDocument();
    expect(screen.getByText("Total Area Covered (acres)")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    // No placeholder row — the first row appears only when its run starts. getAllByRole("row")
    // finds just the header row.
    expect(screen.getAllByRole("row")).toHaveLength(1);
  });

  it("formats the run's values, rounding area to whole acres", () => {
    const row = addRun(table, 1, { lavaThickness: 18, eruptionVolume: 200000000 });
    row.setAcresCovered(21185.6);
    row.setComplete(true);

    render(<MultirunTable multirunTable={table} />);

    const cells = within(rowFor(1)).getAllByRole("cell");
    expect(cells[1]).toHaveTextContent("18");
    expect(cells[2]).toHaveTextContent("200,000,000");
    expect(cells[3]).toHaveTextContent("21,186");
  });

  describe("while the program is running", () => {
    beforeEach(() => {
      const first = addRun(table, 1);
      first.setComplete(true);
      addRun(table, 2); // the erupting run
      lavaSimulation.setSelectedRunNumber(2);
    });

    it("shows the erupting run as selected and at full strength, but not pickable", () => {
      render(<MultirunTable multirunTable={table} running={true} />);

      const erupting = rowFor(2);
      expect(erupting).toHaveClass("selected");
      expect(erupting).not.toHaveClass("dimmed");
      expect(erupting).toHaveClass("not-selectable");
      expect(within(erupting).getByRole("button")).toBeDisabled();
    });

    it("dims the runs it has already moved past, and they aren't pickable either", () => {
      render(<MultirunTable multirunTable={table} running={true} />);

      const earlier = rowFor(1);
      expect(earlier).toHaveClass("dimmed");
      expect(earlier).not.toHaveClass("selected");
      expect(earlier).toHaveClass("not-selectable");
      expect(within(earlier).getByRole("button")).toBeDisabled();
    });
  });

  describe("once the program has stopped", () => {
    beforeEach(() => {
      addRun(table, 1).setComplete(true);
      addRun(table, 2).setComplete(true);
      lavaSimulation.setSelectedRunNumber(2);
    });

    it("makes every completed run pickable and undimmed", () => {
      render(<MultirunTable multirunTable={table} running={false} />);

      [1, 2].forEach(n => {
        expect(rowFor(n)).not.toHaveClass("dimmed");
        expect(rowFor(n)).not.toHaveClass("not-selectable");
        expect(within(rowFor(n)).getByRole("button")).not.toBeDisabled();
      });
    });

    it("selects a run when its row is clicked", () => {
      render(<MultirunTable multirunTable={table} running={false} />);

      fireEvent.click(rowFor(1));
      expect(lavaSimulation.selectedRunNumber).toBe(1);
    });

    it("scrolls a clicked row into view, moving the least amount needed", () => {
      render(<MultirunTable multirunTable={table} running={false} />);

      const row = rowFor(1);
      fireEvent.click(row);

      expect(row.scrollIntoView).toHaveBeenCalledWith({ block: "nearest", behavior: "smooth" });
    });

    it("doesn't scroll a row that can't be selected", () => {
      addRun(table, 3); // still running, not selectable
      render(<MultirunTable multirunTable={table} running={false} />);

      const row = rowFor(3);
      fireEvent.click(row);

      expect(row.scrollIntoView).not.toHaveBeenCalled();
    });

    it("keeps a run selected when it is clicked again — selection is one-way", () => {
      render(<MultirunTable multirunTable={table} running={false} />);

      fireEvent.click(rowFor(1));
      fireEvent.click(rowFor(1));
      expect(lavaSimulation.selectedRunNumber).toBe(1);
    });

    it("marks the selected run with aria-pressed for screen readers", () => {
      render(<MultirunTable multirunTable={table} running={false} />);

      expect(within(rowFor(2)).getByRole("button")).toHaveAttribute("aria-pressed", "true");
      expect(within(rowFor(1)).getByRole("button")).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("scrolling", () => {
    // jsdom implements neither layout nor Element.scrollTo, so scrollHeight is always 0 and
    // scrollTo is absent. Both are stubbed so the real code path can be asserted.
    let scrollTo: jest.Mock;

    const stubScrollHeight = (value: number) =>
      Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, value });

    const stubReducedMotion = (reduce: boolean) =>
      Object.defineProperty(window, "matchMedia", {
        configurable: true,
        value: (query: string) => ({ matches: reduce && query.includes("prefers-reduced-motion") })
      });

    beforeEach(() => {
      scrollTo = jest.fn(function (this: HTMLElement, options: ScrollToOptions) {
        this.scrollTop = options.top ?? 0;
      });
      Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: scrollTo });
    });

    afterEach(() => stubScrollHeight(0));

    it("scrolls smoothly to the newest run as it is added", () => {
      stubScrollHeight(400);
      addRun(table, 1).setComplete(true);

      const { rerender } = render(<MultirunTable multirunTable={table} />);
      scrollTo.mockClear();

      addRun(table, 2);
      rerender(<MultirunTable multirunTable={table} />);

      expect(scrollTo).toHaveBeenCalledWith({ top: 400, behavior: "smooth" });
      expect(screen.getByTestId("multirun-table-body").scrollTop).toBe(400);
    });

    it("doesn't scroll on mount — switching tabs remounts the table", () => {
      stubScrollHeight(400);
      addRun(table, 1).setComplete(true);
      addRun(table, 2).setComplete(true);

      // A fresh mount, as happens every time the Multirun tab is reselected.
      render(<MultirunTable multirunTable={table} />);

      expect(scrollTo).not.toHaveBeenCalled();
    });

    it("jumps instead of animating when the viewer prefers reduced motion", () => {
      stubScrollHeight(400);
      stubReducedMotion(true);
      addRun(table, 1).setComplete(true);

      const { rerender } = render(<MultirunTable multirunTable={table} />);
      scrollTo.mockClear();

      addRun(table, 2);
      rerender(<MultirunTable multirunTable={table} />);

      expect(scrollTo).toHaveBeenCalledWith({ top: 400, behavior: "auto" });
    });

    it("is a no-op when the table isn't overflowing", () => {
      stubScrollHeight(0);
      addRun(table, 1).setComplete(true);

      render(<MultirunTable multirunTable={table} />);

      expect(screen.getByTestId("multirun-table-body").scrollTop).toBe(0);
    });
  });

  it("does not select a run that hasn't finished, even if its row is clicked", () => {
    addRun(table, 1); // still running, no footprint to show
    lavaSimulation.setSelectedRunNumber(undefined);

    render(<MultirunTable multirunTable={table} running={false} />);
    fireEvent.click(rowFor(1));

    expect(lavaSimulation.selectedRunNumber).toBeUndefined();
  });
});
