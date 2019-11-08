export enum WidgetPanelTypes {
  RIGHT = "right",
  LEFT = "left",
}
export type WidgetPanelInfo = {
  [type in WidgetPanelTypes]: {
    backgroundColor: string;
    highlightColor: string;
    textColor: string;
    highlightTextColor: string;
  }
};
export const kWidgetPanelInfo: WidgetPanelInfo = {
  right: {
    backgroundColor: "#DDEDFF",
    highlightColor: "#4aa9ff",
    textColor: "#434343",
    highlightTextColor: "#007eff",
  },
  left: {
    backgroundColor: "#FFDBAC",
    highlightColor: "#ffac00",
    textColor: "#434343",
    highlightTextColor: "#FF9300",
  },
};
