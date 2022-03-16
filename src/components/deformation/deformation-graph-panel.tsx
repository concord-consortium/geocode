import * as React from "react";
import { BaseComponent, IBaseProps } from "../base";
import {SvgD3LineChart} from '../charts/svg-d3-line-chart';

interface IState {
    tabIndex: number;
}

interface IProps extends IBaseProps {
    height: number;
    width: number;
}

export class DeformationGraphPanel extends BaseComponent<IProps, IState> {
    public render(){
        return (
        <SvgD3LineChart/>
        );
    }
}
