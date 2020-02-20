import * as React from "react";
import styled from "styled-components";
import IconButton from "./buttons/icon-button";
import { SectionTypes, kTabInfo } from "./tabs";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";

const CanvDiv = styled.div`
    border: 1px solid black; border-radius: 0px;
    margin: 1em;
    white-space: pre-line;
    position: relative;
    overflow: auto;
    width: ${(p: ILog) => `${p.width}px`};
    height: ${(p: ILog) => `${p.height}px`};
`;

const LogDiv = styled.div`
    width: "100%";
    height: "100%";
    overflow: auto;
    margin: 4px;
`;

const IconButtonHolder = styled.div`
    position: absolute;
    top: 5px;
    right: 3px;
    width: 100px;
`;

interface IState{}
interface IProps extends IBaseProps {
    width: number;
    height: number;
    clear: any;
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
        const { height, width, clear } = this.props;
        const { log } = this.stores.simulation;

        return(
            <CanvDiv ref={this.ref} height={height} width={width}>
                <IconButtonHolder>
                    <IconButton
                        onClick={clear}
                        disabled={false}
                        label={"Clear Log"}
                        hoverColor={"#BBD9FF"}
                        activeColor={"#DDEDFF"}
                        fill={"black"}
                        width={26}
                        height={26}
                    />
                </IconButtonHolder>
                <LogDiv>
                    {log}
                </LogDiv>
            </CanvDiv>
        );
    }
}
