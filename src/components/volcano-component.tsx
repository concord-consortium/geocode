import * as React from "react";
import Volcano from "../volcano";
import styled from "styled-components";

const SimDiv = styled.div`
  border: 2px solid black; border-radius: 10px;
`;

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
      <SimDiv>
        <canvas ref={this.canvRef} width={500} height={500}/>
      </SimDiv>
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
