import type { FocusEvent, KeyboardEvent, MouseEvent } from "react";
import styled from "styled-components";
import {
  Tab as UnstyledTab,
  TabList as UnstyledTabList,
  Tabs as UnstyledTabs,
  TabPanel as UnstyledTabPanel
} from "react-tabs";
import { UnitNameType } from "../stores/unit-store";

enum SectionTypes {
  BLOCKS = "blocks",
  CODE = "code",
  CONTROLS = "controls",
  DATA = "data"
}
type TabInfo = {
  [tab in SectionTypes]: {
    name: string;
    index: number;
    backgroundColor: string;
    hoverBackgroundColor: string;
  }
};
const kTabInfo: TabInfo = {
  blocks: {
    name: "Blocks",
    index: -1,
    backgroundColor: "#DDEDFF",
    hoverBackgroundColor: "#CFE1FE",
  },
  code: {
    name: "Code",
    index: -1,
    backgroundColor: "#BBD9FF",
    hoverBackgroundColor: "#AECEFF",
  },
  controls: {
    name: "Controls",
    index: -1,
    backgroundColor: "#FFCA79",
    hoverBackgroundColor: "#FABF6E",
  },
  data: {
    name: "Data",
    index: -1,
    backgroundColor: "#BBD9FF",
    hoverBackgroundColor: "#AECEFF",
  }
};

enum RightSectionTypes {
  CONDITIONS = "conditions",
  CROSS_SECTION = "crossSection",
  MONTE_CARLO = "monteCarlo",
  DATA = "data",
  DEFORMATION = "deformation"
}
type RightTabInfo = {
  [tab in RightSectionTypes]: {
    name: string;
    unitDisplayName?: { [unit in UnitNameType ]: string };
    index: number;
    backgroundColor: string;
    hoverBackgroundColor: string;
    unitBackgroundColor?: { [unit in UnitNameType ]: string };
    unitHoverBackgroundColor?: { [unit in UnitNameType ]: string };
  }
};
const kRightTabInfo: RightTabInfo = {
  conditions: {
    name: "Conditions",
    unitDisplayName: {
      LavaCoder: "Map",
      Tephra: "Conditions",
      Seismic: "Map"
    },
    index: -1,
    backgroundColor: "#b7dcad",
    hoverBackgroundColor: "#add1a2",
  },
  crossSection: {
    name: "Cross-Section",
    index: -1,
    backgroundColor: "#cee6c9",
    hoverBackgroundColor: "#c3dabd",
  },
  monteCarlo: {
    name: "Monte-Carlo",
    index: -1,
    backgroundColor: "#cee6c9",
    hoverBackgroundColor: "#c3dabd",
  },
  data: {
    name: "Data",
    unitDisplayName: {
      LavaCoder: "Multirun",
      Tephra: "Data",
      Seismic: "Data"
    },
    index: -1,
    backgroundColor: "#e6f2e4",
    hoverBackgroundColor: "#dae6d7",
    unitBackgroundColor: {
      LavaCoder: "#cee6c9",
      Tephra: "#e6f2e4",
      Seismic: "#cee6c9"
    },
    unitHoverBackgroundColor: {
      LavaCoder: "#c3dabd",
      Tephra: "#dae6d7",
      Seismic: "#c3dabd"
    },
  },
  deformation: {
    name: "Deformation",
    index: -1,
    backgroundColor: "#e6f2e4",
    hoverBackgroundColor: "#dae6d7",
  }
};

interface TabBackProps {
  width: number;
  backgroundcolor: string;
}
const TabBack = styled.div`
  height: 15px;
  background-color: ${(p: TabBackProps) => p.backgroundcolor};
  position: absolute;
  width: 50%;
  top: 16px;
  left: 0px;
`;

const RightTabBack = styled.div`
  height: 15px;
  background-color: ${(p: TabBackProps) => p.backgroundcolor};
  position: absolute;
  width: ${(p: TabBackProps) => `${p.width - 27}px`};
  bottom: 20px;
  right: 27px;
`;

const Tabs = styled(UnstyledTabs)`
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  margin:0;
  width: 50%;
`;
const HistogramTabs = styled(Tabs)`
  width: 100%;
  background: none;
`;

const TabList = styled(UnstyledTabList)`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
`;

interface TabProps {
  selected: boolean;
  leftofselected?: string;
  rightofselected?: string;
  backgroundcolor: string;
  backgroundhovercolor: string;
  color?: string;
}
const Tab = styled(UnstyledTab)<TabProps>`
  flex-grow: 1;
  text-align: center;
  padding: 3px 0;
  margin: 0;
  list-style: none;
  cursor: pointer;
  color: ${props => props.color ? props.color : "#434343"};
  background-color: ${props => props.backgroundcolor};
  font-size: 16px;
  border-style: solid;
  border-color: white;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom-left-radius: ${props => props.rightofselected === "true" ? "10px" : "0px"};
  border-bottom-right-radius: ${props => props.leftofselected === "true" ? "10px" : "0px"};
  border-width: ${props => props.selected ? "0px" : "2px"};
  z-index: 1;
  &:first-child {
    border-bottom-left-radius 0px;
  }
  &:last-child {
    border-bottom-right-radius 0px;
  }
  &:hover {
    background-color: ${props => props.backgroundhovercolor};
  }
  &.disabled {
    color: #e0e0e0;
    cursor: not-allowed;
  }
`;
const BottomTab = styled(Tab)<TabProps>`
  /* react-tabs gives the selected tab tabIndex="0", so clicking it left the browser's default
     focus ring on screen. :focus-visible keeps the ring for keyboard users, who need it, and
     drops it for pointer users, who don't. */
  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: -4px;
  }
  /* react-tabs focuses the selected tab programmatically on click (focusTabOnClick defaults
     to true) and Chrome treats programmatic focus as keyboard-like, so :focus-visible alone
     still painted a ring on plain clicks. pointerFocusProps marks the tab while the
     interaction is a pointer one, which tells the two apart without relying on the browser's
     heuristic. Keyboard focus is untouched, so arrow-key navigation still shows a ring. */
  &[data-pointer-focus]:focus-visible {
    outline: none;
  }
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  border-top-left-radius: ${props => props.rightofselected === "true" ? "10px" : "0px"};
  border-top-right-radius: ${props => props.leftofselected === "true" ? "10px" : "0px"};
  &:first-child {
    border-bottom-left-radius 10px;
    border-top-left-radius 0px;
  }
  &:last-child {
    border-bottom-right-radius 10px;
    border-top-right-radius 0px;
  }
`;

interface TabPanelProps {
  tabcolor: string;
  width: string;
  rightpanel?: string;
}
const TabPanel = styled(UnstyledTabPanel).attrs({ selectedClassName: "selected" })<TabPanelProps>`
  display: none;
  border: none;
  width: 100%;
  background-color: ${props => props.tabcolor || "white"};
  border-radius: ${props => props.rightpanel && "10px 10px 10px 0" || "0 0 10px 10px"};
  margin: 0px;
  padding: 0px;
  overflow: hidden;
  min-height: 0px;
  flex-grow: 1;
  &.selected {
    display: block;
  }
`;

/**
 * Spread onto a BottomTab so a pointer click doesn't leave a focus ring behind. See the
 * comment in BottomTab for why :focus-visible isn't enough on its own.
 */
export const pointerFocusProps = {
  onMouseDown: (e: MouseEvent<HTMLElement>) =>
    e.currentTarget.setAttribute("data-pointer-focus", "true"),
  onKeyDown: (e: KeyboardEvent<HTMLElement>) =>
    e.currentTarget.removeAttribute("data-pointer-focus"),
  onBlur: (e: FocusEvent<HTMLElement>) => {
    // Switching to another app fires blur on the focused tab too, but focus is restored to
    // that same tab on return — with no new mousedown. Clearing the mark here would let
    // :focus-visible paint a ring the user never asked for, just from leaving and coming
    // back. document.hasFocus() is false for a window blur and true when focus is really
    // moving elsewhere in the page, which is the case we want to clear on.
    if (document.hasFocus()) e.currentTarget.removeAttribute("data-pointer-focus");
  }
};

(Tab as any).tabsRole = "Tab";
(Tabs as any).tabsRole = "Tabs";
(TabPanel as any).tabsRole = "TabPanel";
(TabList as any).tabsRole = "TabList";

export { SectionTypes, TabInfo, kTabInfo, TabBack, Tab, TabList, Tabs, TabPanel,
         RightSectionTypes, kRightTabInfo, RightTabBack, BottomTab, HistogramTabs };
