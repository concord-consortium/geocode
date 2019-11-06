export enum WidgetPanelTypes {
  RIGHT = "right",
  LEFT = "left",
}
export type WidgetPanelInfo = {
  [type in WidgetPanelTypes]: {
    backgroundColor: string;
    highlightColor: string;
  }
};
export const kWidgetPanelInfo: WidgetPanelInfo = {
  right: {
    backgroundColor: "#DDEDFF",
    highlightColor: "#4AA9FF",
  },
  left: {
    backgroundColor: "#FFDBAC",
    highlightColor: "#FF9300",
  },
};
