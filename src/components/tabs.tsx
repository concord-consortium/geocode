import styled from "styled-components";
import {
  Tab as UnstyledTab,
  TabList as UnstyledTabList,
  Tabs as UnstyledTabs,
  TabPanel as UnstyledTabPanel
} from "react-tabs";

enum SectionTypes {
  BLOCKS = "blocks",
  CODE = "code",
  CONTROLS = "controls"
}
type TabInfo = {
  [tab in SectionTypes]: {
    name: string;
    backgroundColor: string;
    hoverBackgroundColor: string;
  }
};
const kTabInfo: TabInfo = {
  blocks: {
    name: "Blocks",
    backgroundColor: "#DDEDFF",
    hoverBackgroundColor: "#CFE1FE",
  },
  code: {
    name: "Code",
    backgroundColor: "#BBD9FF",
    hoverBackgroundColor: "#AECEFF",
  },
  controls: {
    name: "Controls",
    backgroundColor: "#FFCA79",
    hoverBackgroundColor: "#FABF6E",
  },
};

interface TabBackProps {
  width: number;
  backgroundcolor: string;
}
const TabBack = styled.div`
  height: 15px;
  background-color: ${(p: TabBackProps) => p.backgroundcolor};
  position: absolute;
  width: ${(p: TabBackProps) => `${p.width}px`};
  top: 16px;
  left: 4px;
`;

const Tabs = styled(UnstyledTabs)`
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  margin: 0 0 0 2px;
`;

const TabList = styled(UnstyledTabList)`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 0;
  margin: 2px 0 0 0;
`;

interface TabProps {
  borderwidth: string;
  leftradius: string;
  rightradius: string;
  backgroundcolor: string;
  backgroundhovercolor: string;
}
const Tab = styled(UnstyledTab)<TabProps>`
  flex-grow: 1;
  text-align: center;
  padding: 3px 0;
  margin: 0;
  list-style: none;
  cursor: pointer;
  color: #434343;
  background-color: ${props => props.backgroundcolor};
  font-size: 16px;
  border-style: solid;
  border-color: white;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom-left-radius: ${props => props.leftradius};
  border-bottom-right-radius: ${props => props.rightradius};
  border-width: ${props => props.borderwidth};
  z-index: 1;
  &:hover {
    background-color: ${props => props.backgroundhovercolor};
  }
  &.disabled {
    color: #e0e0e0;
    cursor: not-allowed;
  }
`;

const TabPanel = styled(UnstyledTabPanel).attrs({ selectedClassName: "selected" })`
  display: none;
  padding: 0px 0;
  border: none;
  border-radius: 0 0 10px 10px;
  margin: 0 0 2px 0;
  flex-grow: 1;
  &.selected {
    display: block;
  }
`;

interface FixWidthTabPanelProps {
  tabcolor: string;
  width: string;
}
const FixWidthTabPanel = styled(TabPanel)<FixWidthTabPanelProps>`
  width: ${props => props.width || "300px"};
  background-color: ${props => props.tabcolor || "white"};
  padding: 3px;
`;

(Tab as any).tabsRole = "Tab";
(Tabs as any).tabsRole = "Tabs";
(TabPanel as any).tabsRole = "TabPanel";
(FixWidthTabPanel as any).tabsRole = "TabPanel";
(TabList as any).tabsRole = "TabList";

export { SectionTypes, TabInfo, kTabInfo, TabBack, Tab, TabList, Tabs, TabPanel, FixWidthTabPanel };
