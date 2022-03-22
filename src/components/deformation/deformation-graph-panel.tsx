import * as React from "react";
import { BaseComponent, IBaseProps } from "../base";
import { inject, observer } from "mobx-react";
import {SvgD3LineChart} from "../charts/svg-d3-line-chart";
import { toJS } from "mobx";

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
        return (
        deformationGraphData.length ?
            <SvgD3LineChart
                data={toJS(deformationGraphData)}
                />
            : <div> The graph will show here once there is data </div>
        );
    }
}
