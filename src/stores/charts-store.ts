import { types } from "mobx-state-tree";
import * as d3 from "d3";
import { Dataset, WindData } from "./data-sets";
import { SamplesCollectionModelType } from "./samples-collections-store";

export const ChartType = types.enumeration("type", ["scatter", "radial", "histogram"]);
export type ChartTypeType = typeof ChartType.Type;

export const ChartStyle = types.enumeration("type", ["dot", "arrow"]);
export type ChartStyleType = typeof ChartStyle.Type;

type ChartData = Array<Array<number|Date>> | number[];
type Column = number|Date;

const Chart = types.model("Chart", {
  type: ChartType,
  chartStyle: types.maybe(ChartStyle),      // rendering options, given a specific type
  // [x,y], [deg,mag], or [date, y] tuples
  data: types.array(types.union(types.array(types.union(types.number, types.Date)), types.number)),
  title: types.maybe(types.string),
  customExtents: types.array(types.array(types.number)),
  xAxisLabel: types.maybe(types.string),
  yAxisLabel: types.maybe(types.string),
  dateLabelFormat: types.maybe(types.string),
  threshold: types.maybe(types.number),
})
.views((self) => {
  const isDate = (column: 0|1) => {
    if (self.data.length === 0 || !Array.isArray(self.data[0])) return false;
    return self.data[0][column] instanceof Date;
  };

  // returns one column as an array
  const getColumnData = (column: 0|1) => {
    if (!Array.isArray(self.data[0])) return self.data;
    return self.data.map((d: any) => d[column]);
  };

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
  addChart(chartProps: {type: ChartTypeType, chartStyle?: ChartStyleType, data: ChartData, customExtents?: number[][],
          title?: string, xAxisLabel?: string, yAxisLabel?: string, dateLabelFormat?: string}) {
    const chart = Chart.create(chartProps);
    self.charts.push(chart);
    return chart;     // returns in case anyone wants to use the new chart
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
    const customExtents = [[], WindData.extents.speed];
    const title = _title || "Chart " + (self.charts.length + 1);
    self.addChart({type: "scatter", data, customExtents, title, xAxisLabel, yAxisLabel, dateLabelFormat});
  },

  /**
   * Creates a radial plot of `yAxis` vs direction, for a dataset that is assumed to contain
   * direction values
   */
  addDirectionRadialChart(dataset: Dataset, yAxis: string, yAxisLabel: string, _title?: string){
    const data = dataset.map(d => [d.direction, d[yAxis]]);

    const chartStyle = "arrow"; // may later give students option for "arrow";
    const customExtents = [[], WindData.extents.speed];
    const title = _title || "Chart " + (self.charts.length + 1);
    self.addChart({type: "radial", data, customExtents, title, chartStyle});
  },

  /**
   * Creates a curstom charts based on known properties of wind data.
   */
  addArbitraryChart(dataset: Dataset, xAxis: string, yAxis: string) {
    let data;

    const timeParser = WindData.timeParsers[xAxis];
    if (timeParser) {
      const dateParser = d3.timeParse(timeParser.parser);
      data = dataset.map(d => {
        const dateStr = timeParser.fields.map(f => d[f]).join("-");
        const date = dateParser(dateStr)!;
        return [date, d[yAxis]];
      });
    } else {
      data = dataset.map(d => [d[xAxis], d[yAxis]]);
    }

    const dateLabelFormat = timeParser ? timeParser.label : "";
    const type = xAxis === "direction" ? "radial" : "scatter";
    const chartStyle = "dot";
    const customExtents = [WindData.extents[xAxis] || [], WindData.extents[yAxis] || []];
    const title = "Chart " + (self.charts.length + 1);
    const capFirst = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
    const xAxisLabel = WindData.axisLabel[xAxis] ?  WindData.axisLabel[xAxis] : capFirst(xAxis);
    const yAxisLabel = WindData.axisLabel[yAxis] ?  WindData.axisLabel[yAxis] : capFirst(yAxis);
    self.addChart({type, data, customExtents, title, xAxisLabel, yAxisLabel, chartStyle, dateLabelFormat});
  },

  /**
   * Adds new histogram for a tephra samplesCollection, or updates an existing one.
   */
  addHistogram(samplesCollection: SamplesCollectionModelType, threshold: number, xAxisLabel: string) {
    if (!samplesCollection) return;

    const title = samplesCollection.name;
    let chart = self.charts.find(c => c.title === title);
    if (!chart) {
      chart = self.addChart({
        type: "histogram",
        data: [],
        title,
        xAxisLabel,
        yAxisLabel: "Number of Runs"
      });
    }
    chart.data = samplesCollection.samples.toJS() as any;
    chart.threshold = threshold;
}
}));

export type ChartType = typeof Chart.Type;
export type ChartsModelType = typeof ChartsStore.Type;

export const chartsStore = ChartsStore.create({});
