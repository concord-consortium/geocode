import * as React from "react";
import styled from "styled-components";
import { BaseComponent, IBaseProps } from "../base";
import { inject, observer } from "mobx-react";
import {SvgD3LineChart} from "../charts/svg-d3-line-chart";
import { toJS } from "mobx";

interface PanelProps {
    height: number;
    width: number;
}

const Panel = styled.div`
  background-color: #CEE6C9;
  border-radius: 10px;
  height: ${(p: PanelProps) => `${p.height}px`};
  width: ${(p: PanelProps) => `${p.width - 56}px`};
  margin: 10px 28px;
  box-sizing: content-box;
  positon: absolute;
  top: ${p => `${p.height * .65}px`}
`;

const PanelContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  border-radius: 10px 10px 0 0;
  background-color: #ffffff;
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
export class DeformationGraphPanel extends BaseComponent<IProps, IState> {
    public render(){
        const deformationGraphData = this.stores.seismicSimulation.deformationHistory;
        const {width, height} = this.props;
        return (
            <Panel height={height} width={width} data-test={"deformation-graph-panel"}>
                <PanelContent>
                    {deformationGraphData.length ?
                    <SvgD3LineChart
                        data={toJS(deformationGraphData)}
                        width={toJS(width - 100)}
                        height={toJS(height - 80)}
                    />
                    : <div />
                    }
                </PanelContent>
            </Panel>
        );
    }
}
