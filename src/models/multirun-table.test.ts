import { MultirunTable, MultirunTableType, RunRow } from "./multirun-table";

const makeRow = (runNumber: number, overrides = {}) => RunRow.create({
  runNumber,
  lavaThickness: 10,
  eruptionVolume: 200000000,
  acresCovered: 0,
  ...overrides
});

describe("MultirunTable", () => {
  let table: MultirunTableType;

  beforeEach(() => {
    table = MultirunTable.create();
  });

  it("starts empty, and the first run is numbered 1", () => {
    expect(table.rows.length).toBe(0);
    expect(table.nextRunNumber).toBe(1);
  });

  it("numbers runs sequentially as they are added", () => {
    table.addRow(makeRow(table.nextRunNumber));
    expect(table.nextRunNumber).toBe(2);

    table.addRow(makeRow(table.nextRunNumber));
    table.addRow(makeRow(table.nextRunNumber));

    expect(table.rows.map(r => r.runNumber)).toEqual([1, 2, 3]);
    expect(table.nextRunNumber).toBe(4);
  });

  it("finds a row by run number, and returns undefined for one that doesn't exist", () => {
    table.addRow(makeRow(1));
    table.addRow(makeRow(2));

    expect(table.row(2)?.runNumber).toBe(2);
    expect(table.row(99)).toBeUndefined();
  });

  describe("a row", () => {
    it("starts incomplete, because it is created when its run starts", () => {
      const row = makeRow(1);
      expect(row.complete).toBe(false);
      expect(row.acresCovered).toBe(0);
    });

    it("accumulates area while the run is in progress, then is finalized", () => {
      table.addRow(makeRow(1));
      const row = table.row(1)!;

      row.setAcresCovered(120.4);
      expect(row.acresCovered).toBe(120.4);
      expect(row.complete).toBe(false);

      row.setAcresCovered(980.7);
      row.setComplete(true);
      expect(row.acresCovered).toBe(980.7);
      expect(row.complete).toBe(true);
    });

    it("keeps the parameters it was created with when later rows use different ones", () => {
      table.addRow(makeRow(1, { lavaThickness: 10 }));
      table.addRow(makeRow(2, { lavaThickness: 18 }));

      expect(table.row(1)?.lavaThickness).toBe(10);
      expect(table.row(2)?.lavaThickness).toBe(18);
    });
  });
});
