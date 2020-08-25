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

/**
 * round(11, 2) -> 11
 * round(11.456, 2) -> 11.46
 */
export const round = (num: number, maxPrecision: number) => {
  const factor = Math.pow(10, maxPrecision);
  const roundedTempNumber = Math.round(num * factor);
  return roundedTempNumber / factor;
};
