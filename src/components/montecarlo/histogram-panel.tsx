import * as React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { BaseComponent, IBaseProps } from "../base";

interface PanelProps {
  height: number;
  width: number;
}
const Panel = styled.div`
  border: 0px solid black; border-radius: 0px;
  background-color: white;
  height: ${(p: PanelProps) => `${p.height}px`};
  width: ${(p: PanelProps) => `${p.width - 56}px`};
  margin: 10px 28px;
  box-sizing: content-box;
`;

interface IState {
  bars: boolean;
}

interface IProps extends IBaseProps {
  height: number;
  width: number;
}

@inject("stores")
@observer
export class HistogramPanel extends BaseComponent<IProps, IState>{

  constructor(props: IProps) {
    super(props);
    const initialState: IState = {
      bars: false,
    };
    this.state = initialState;
  }

  public render() {
    const {width, height} = this.props;

    return (
      <Panel height={height} width={width}>
        MONTE CARLO
      </Panel>
    );
  }

}
