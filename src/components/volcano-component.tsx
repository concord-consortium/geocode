import { inject, observer } from "mobx-react";
import * as React from "react";
import { BaseComponent, IBaseProps } from "./base";
import Volcano from "../volcano";
import { SimulationModelType } from "../models/volcano-store";

interface IProps extends IBaseProps {
  windSpeed: number;
  windDirection: number;
}

interface IState {}

export class VolcanoComponent extends React.Component<IProps, IState>{

  private canvRef = React.createRef<HTMLCanvasElement>();
  private intervalRef: any  = null;
  private volcano: Volcano | null = null;

  public componentDidMount() {
    this.volcano = new Volcano(this.canvRef.current);
    this.setInterval(500);
  }

  public componentDidUpdate(prevProps: IProps) {
    console.log(this.props);
    this.resetInterval(500);
  }

  public render() {
    return (
      <div className="VolcanoSim">
        <canvas ref={this.canvRef} width={500} height={500}/>
      </div>
    );
  }

  private clearInterval() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }
  private setInterval(millies: number) {
    const {windSpeed, windDirection } = this.props;
    const x = windSpeed * Math.cos(windDirection);
    const y = windSpeed * Math.sin(windDirection);
    this.intervalRef = setInterval(() => {
      if (this.volcano) {
        this.volcano.wind.x = x;
        this.volcano.wind.y = y;
        this.volcano.run();
      }
    }, millies);
  }

  private resetInterval(millies: number) {
    this.clearInterval();
    this.setInterval(millies);
  }
}
