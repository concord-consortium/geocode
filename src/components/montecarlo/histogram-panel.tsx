import * as React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { BaseComponent, IBaseProps } from "../base";
import { HorizontalContainer, VerticalContainer } from "../styled-containers";
import { SvgD3HistogramChart } from "../charts/svg-d3-histogram-chart";
import { ChartType } from "../../stores/charts-store";
import { RiskDiamond, RiskDiamondText } from "../map/map-risk-legend";
import { ThresholdData, calculateThresholdData, calculateRisk, RiskLevel, RiskLevels } from "./monte-carlo";
import { Tab, HistogramTabs, TabList, TabPanel } from "../tabs";

interface PanelProps {
  height: number;
  width: number;
}
const Panel = styled.div`
  border: 0px solid black; border-radius: 0px;
  background-color: #cee6c9;
  border-radius: 10px 10px 0 0;
  height: ${(p: PanelProps) => `${p.height}px`};
  width: ${(p: PanelProps) => `${p.width - 56}px`};
  margin: 10px 28px;
  box-sizing: content-box;
`;
interface PanelContentProps {
  color?: string;
}
const PanelContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  border-radius: 10px 10px 0 0;
  background-color: ${(p: PanelContentProps) => p.color ? p.color : "none"};
`;
const PanelHistogramDiv = styled.div`
  min-width: ${(p: PanelProps) => `${p.width}px`};
  height: ${(p: PanelProps) => `${p.height}px`};
`;
interface PanelStatProps {
  marginRight?: number;
}
const PanelStat = styled.div`
  margin: 5px;
  font-size: 14px;
  margin-right: ${(p: PanelStatProps) => `${p.marginRight ? p.marginRight : 5}px`};
`;
const RiskContainer = styled(HorizontalContainer)`
  margin-top: 15px;
`;
const PanelPercent = styled.div`
  height: 15px;
  width: 100px;
`;
const PercentBack = styled.div`
  width: 100px;
  height: 10px;
  border: 1px solid #CCD1D7;
  border-radius: 10px;
  position: absolute;
`;
interface PercentProps {
  percent: number;
}
const PercentFront = styled.div`
  width: ${(p: PercentProps) => `${p.percent}px`};
  height: 10px;
  background-color: #0074EB;
  border: 1px solid #93C4F7;
  border-radius: ${(p: PercentProps) => `10px ${p.percent > 97 ? 10 : 0}px ${p.percent > 97 ? 10 : 0}px 10px`};
  position: absolute;
`;

interface IState {
  tabIndex: number;
}

interface IProps extends IBaseProps {
  height: number;
  width: number;
}

@inject("stores")
@observer
export class HistogramPanel extends BaseComponent<IProps, IState>{

  public constructor(props: IProps) {
    super(props);
    this.handleTabSelect = this.handleTabSelect.bind(this);
    const initialState: IState = {
      tabIndex: 0,
    };
    this.state = initialState;
  }

  public render() {
    const {width, height} = this.props;
    const histogramCharts = this.stores.chartsStore.charts.filter(chart => chart.type === "histogram");
    return (
      <Panel height={height} width={width}>
        <PanelContent color={histogramCharts.length ? undefined : "white"}>
          <HistogramTabs selectedIndex={this.state.tabIndex} onSelect={this.handleTabSelect}>
            <TabList>
              { histogramCharts.map( (chart: ChartType, i) => {
                  return (
                    <Tab
                      selected={this.state.tabIndex === i}
                      backgroundcolor={this.state.tabIndex === i ? "white" : "#E6E6E6"}
                      backgroundhovercolor={this.state.tabIndex === i ? "white" : "#C0C0C0"}
                      color={this.state.tabIndex === i ? "#4AA9FF" : "#434343"}
                      key={"histogramTab-" + i}
                    >
                      {chart.title}
                    </Tab>
                  );
                })
              }
            </TabList>
            { histogramCharts.map((chart, i) => this.renderHistogramTab(chart, i)) }
          </HistogramTabs>
        </PanelContent>
      </Panel>
    );
  }

  public componentDidUpdate() {
    const histogramCharts = this.stores.chartsStore.charts.filter(chart => chart.type === "histogram");
    if (this.state.tabIndex > 0 && histogramCharts && this.state.tabIndex > (histogramCharts.length - 1)) {
      this.setState({tabIndex: 0});
      this.stores.uiStore.setCurrentHistogramTab(0);
    }
  }

  private handleTabSelect(tabIndex: number) {
    this.setState({tabIndex});
    this.stores.uiStore.setCurrentHistogramTab(tabIndex);
  }

  private renderHistogramTab = (histogramChart: ChartType, i: number) => {
    const {width, height} = this.props;
    const percentComplete = undefined;
    const data = histogramChart && histogramChart.data;
    const threshold = histogramChart && histogramChart.threshold ? histogramChart.threshold : 0;
    const thresholdData: ThresholdData = calculateThresholdData(data, threshold);
    const riskLevelType = calculateRisk(thresholdData.greaterThanPercent);
    const riskLevel: RiskLevel | undefined = RiskLevels.find((risk) => risk.type === riskLevelType);
    const riskStyle = riskLevel && {color: riskLevel.iconColor};
    return (
      <TabPanel
        width={"100%"}
        tabcolor={"white"}
        key={"histogramTabPanel-" + i}
      >
        <HorizontalContainer>
          { histogramChart
            ? this.renderHistogram(histogramChart, threshold)
            : <PanelHistogramDiv
                width={width - 200}
                height={height - 10}
              />
          }
          <VerticalContainer>
            { percentComplete !== undefined &&
              <PanelStat>
                <PanelPercent>
                  <PercentBack/>
                  { percentComplete > 0
                    ? <PercentFront percent={percentComplete}/>
                    : null
                  }
                </PanelPercent>
                {`${percentComplete}% complete`}
              </PanelStat>
            }
            <PanelStat>{`Runs completed: ${data ? data.length : 0}`}</PanelStat>
            <PanelStat>{`Threshold = ${threshold} mm`}</PanelStat>
            <PanelStat>
              {`Count below threshold: ${thresholdData.lessThanEqual} (${thresholdData.lessThanEqualPercent}%)`}
            </PanelStat>
            <PanelStat>
              {`Count above threshold: ${thresholdData.greaterThan} (${thresholdData.greaterThanPercent}%)`}
            </PanelStat>
            <RiskContainer>
              <PanelStat marginRight={10}>
                {"Risk:"}
                {data && riskLevelType && (!percentComplete || percentComplete === 100)
                  ? <span style={riskStyle}>{` ${riskLevelType}`}</span>
                  : " ---"
                }
              </PanelStat>
              {data && riskLevel &&
                <RiskDiamond backgroundColor={riskLevel.iconColor}>
                  <RiskDiamondText>
                    {riskLevel.iconText}
                  </RiskDiamondText>
                </RiskDiamond>
              }
            </RiskContainer>
          </VerticalContainer>
        </HorizontalContainer>
      </TabPanel>
    );
  }

  private renderHistogram = (chart: ChartType, threshold: number) => {
    const { width, height } = this.props;
    return (
      <SvgD3HistogramChart
        width={width - 200}
        height={height - 40}
        chart={chart}
        chartMin={0}
        chartMax={threshold * 2}
        threshold={threshold}
      />
    );
  }

}
