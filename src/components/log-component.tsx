import * as React from "react";
import styled from "styled-components";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";
import { Stage } from "@inlet/react-pixi";

const CanvDiv = styled.div`
    border: 1px solid black; border-radius: 0px;
    margin: 1em;
    white-space: pre-line;
    position: relative;
    width: ${(p: ILog) => `${p.width}px`};
    height: ${(p: ILog) => `${p.height}px`};
`;

const LogDiv = styled.div`
    width: "100%";
    height: "100%";
    overflow: "auto";
    margin: 4px;
`;

const StyledButton = styled.div`
  padding: 0.25em;
  margin: 0.25em;
  border: 1px solid hsl(0, 0%, 25%);
  border-radius: 0.2em;
`;

const HighliteButton = styled(StyledButton)`
  background-color: ${(p: {selected?: boolean}) => p.selected ? "black" : "white"};
  color: ${(p: {selected?: boolean}) => p.selected ? "white" : "black"};
  position: absolute;
  top: 0;
  right: 0;
`;

interface IState{}
interface IProps extends IBaseProps {
    width: number;
    height: number;
    log: string;
    running?: boolean;
    clear: () => void;
}
interface ILog {
    width: number;
    height: number;
}

@inject("stores")
@observer
export class LogComponent extends BaseComponent<IProps, IState> {

    private ref = React.createRef<HTMLDivElement>();

    public render() {
        const { log, height, width, clear } = this.props;

        return(
            <CanvDiv ref={this.ref} height={height} width={width}>
                <HighliteButton onClick={clear}>Clear Log</HighliteButton>
                <LogDiv>
                    {log}
                </LogDiv>
            </CanvDiv>
        );
    }
}
