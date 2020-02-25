import { types } from "mobx-state-tree";
import * as d3 from "d3";
import { Dataset } from "./data-sets";

export const ChartType = types.enumeration("type", ["scatter", "radial", "histogram"]);
export type ChartTypeType = typeof ChartType.Type;

export const ChartStyle = types.enumeration("type", ["dot", "arrow"]);
export type ChartStyleType = typeof ChartStyle.Type;

type ChartData = Array<Array<number|Date>>;
type Column = number|Date;

const Chart = types.model("Chart", {
  type: ChartType,
  chartStyle: types.maybe(ChartStyle),      // rendering options, given a specific type
  data: types.array(types.array(types.union(types.number, types.Date))), // [x,y], [deg,mag], or [date, y] tuples
  title: types.maybe(types.string),
  customExtents: types.array(types.array(types.number)),
  xAxisLabel: types.maybe(types.string),
  yAxisLabel: types.maybe(types.string),
  dateLabelFormat: types.maybe(types.string),
})
.views((self) => {
  const isDate = (column: 0|1) => {
    if (self.data.length === 0) return false;
    return self.data[0][column] instanceof Date;
  };

  // returns one column as an array
  const getColumnData = (column: 0|1) => self.data.map(d => d[column]);

  // returns a function to convert a Date to a string, given an axis
  const toDateString = () => {
    return d3.timeFormat(self.dateLabelFormat!);
  };

  // returns min and max of column
  const extent = (column: 0|1) => {
    if (self.customExtents[column] && self.customExtents[column].length) {
      return self.customExtents[column];
    }
    const columnData = getColumnData(column);
    if (columnData.length === 0) return [0, 0];
    if (typeof columnData[0] === "number") {
      // assume starting at 0 for now
      return [0, Math.max(...columnData as number[])];
    } else {
      return d3.extent(columnData) as [Date, Date];
    }
  };

  return {
    isDate,
    getColumnData,
    toDateString,
    extent,
  };
});

const ChartsStore = types.model("Charts", {
  charts: types.array(Chart)
})
.actions((self) => ({
  addChart(chart: {type: ChartTypeType, chartStyle?: ChartStyleType, data: ChartData, customExtents?: number[][],
          title?: string, xAxisLabel?: string, yAxisLabel?: string, dateLabelFormat?: string}) {
    self.charts.push(Chart.create(chart));
  },

  reset() {
    self.charts.length = 0;
  }
}))
.actions((self) => ({
  // Utility functions for common charts

  /**
   * Creates a scatter plot of `yAxis` vs date, for a dataset that is assumed to contain
   * year, month and day values
   */
  addDateScatterChart(dataset: Dataset, yAxis: string, yAxisLabel: string, _title?: string) {
    const dateParser = d3.timeParse("%Y-%m-%d");
    const data = dataset.map(d => {
      const dateStr = d.year + "-" + d.month + "-" + d.day;
      const date = dateParser(dateStr)!;
      return [date, d[yAxis]];
    });
    const xAxisLabel = "Date";
    const dateLabelFormat = "%b %Y";
    const title = _title || "Chart " + (self.charts.length + 1);
    self.addChart({type: "scatter", data, title, xAxisLabel, yAxisLabel, dateLabelFormat});
  }
}));

export type ChartType = typeof Chart.Type;
export type ChartsModelType = typeof ChartsStore.Type;

export const chartsStore = ChartsStore.create({});
