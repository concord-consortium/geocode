import { types } from "mobx-state-tree";

const Chart = types.model("Chart", {
  type: types.union(types.literal("scatter"), types.literal("radial")),
  data: types.array(types.array(types.number)),      // (x,y) or (deg,mag) tuples: [[x,y], [x,y], ...]
  xAxisLabel: types.maybe(types.string),
  yAxisLabel: types.maybe(types.string),
});

const ChartsStore = types.model("Charts", {
  charts: types.array(Chart)
})
.actions((self) => ({
  addChart(type: "scatter" | "radial", data: number[][], xAxisLabel?: string, yAxisLabel?: string) {
    self.charts.push(Chart.create({type, data, xAxisLabel, yAxisLabel}));
  }
}));

export type ChartsModelType = typeof ChartsStore.Type;

export const chartsStore = ChartsStore.create({});
