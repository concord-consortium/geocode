import styled from "styled-components";
import {
  Tab as UnstyledTab,
  TabList as UnstyledTabList,
  Tabs as UnstyledTabs,
  TabPanel as UnstyledTabPanel
} from "react-tabs";

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

const Tab = styled(UnstyledTab).attrs({
  selectedClassName: "selected",
  disabledClassName: "disabled",
})`
  flex-grow: 1;
  text-align: center;
  padding: 3px 0;
  list-style: none;
  cursor: pointer;
  color: #434343;
  font-size: 16px;
  border-left: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  background-color: #BBD9FF;
  border-radius: 10px 10px 0 0;
  border: 1px solid white;
  &:hover {
    background-color: #AECEFF;
  }

  &:first-child {
    border-left: none;
    background-color: #DDEDFF;
  }
  &:first-child:hover {
    background-color: #CFE1FE;
  }

  &:last-child {
    background-color: #FFCA79;
  }
  &:last-child:hover {
    background-color: #FABF6E;
  }

  &.selected {
    color: #434343;
    border-bottom: none;
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

export { Tab, TabList, Tabs, TabPanel, FixWidthTabPanel };
