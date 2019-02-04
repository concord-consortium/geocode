import * as React from "react";
import Volcano from "../volcano";
import styled from "styled-components";

const SimDiv = styled.div`
  border: 2px solid black; border-radius: 10px;
`;

interface IState {}
interface IProps {
  windSpeed: number;
  windDirection: number;
  setCanvas: (elem: HTMLCanvasElement|null) => void;
}

export class VolcanoComponent extends React.Component<IProps, IState>{

  private canvRef = React.createRef<HTMLCanvasElement>();
  private intervalRef: any  = null;
  private volcano: Volcano | null = null;

  public componentDidUpdate(prevProps: IProps) {
    const { setCanvas } = this.props;
    setCanvas(this.canvRef.current);
  }

  public render() {
    return (
      <SimDiv>
        <canvas ref={this.canvRef} width={500} height={500}/>
      </SimDiv>
    );
  }
}
