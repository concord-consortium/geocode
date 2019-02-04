import * as React from "react";
import styled from "styled-components";
import { runReactions } from "mobx/lib/internal";

interface IProps {}
interface IState {}

const Wrapper = styled.div``;
const StartBlocks = styled.div``;

const WorkSpace = styled.div`
  font-family: sans-serif;
  background-color: orange;
  width: 800px;
  height: 400px;
  position: relative;
`;

export default class BlocklyContainer extends React.Component<IProps, IState> {
  private workSpace: any;
  private workSpaceRef = React.createRef<HTMLDivElement>();
  private startBlockRef = React.createRef<HTMLDivElement>();

  public render() {
    return (
      <Wrapper>
        <StartBlocks ref={this.startBlockRef} />
        <WorkSpace ref={this.workSpaceRef} />
      </Wrapper>
    );
  }
  public componentDidMount() {
    // console.log("component did mount");
    this.initializeBlockly();
  }

  public componentDidUpdate() {
    console.log("component did update");
  }

  private initializeBlockly = () => {
    fetch("./toolbox.xml").then((r) => {
      r.text().then( (data) => {
        const blockOpts = {
          media: "blockly/media/",
          toolbox: data
        };
        this.workSpace = Blockly.inject(this.workSpaceRef.current, blockOpts);
        const startBlocks = this.startBlockRef.current;
        Blockly.Xml.domToWorkspace(startBlocks, this.workSpace);
      });
    });
  }

}
