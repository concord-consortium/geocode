import * as React from "react";
import styled from "styled-components";


interface IProps {
  setBlocklyCode?: (code: string) => void;
}

interface IState {}

const Wrapper = styled.div``;
const StartBlocks = styled.div``;

const WorkSpace = styled.div`
  font-family: sans-serif;
  background-color: hsla(30, 50%, 60%, 0.5);
  width: 900px;
  height: 600px;
  position: relative;
  border: 2px solid gray;
  border-radius: 0.5em;
  padding: 1em;
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
    this.initializeBlockly();
  }

  public componentDidUpdate() {
    // console.log(this.toXml());
  }

  private toXml() {
    const xml = Blockly.Xml.workspaceToDom(this.workSpaceRef.current);
    return Blockly.Xml.domToText(xml);
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
        const myUpdateFunction = (event: any) => {
          const code = Blockly.JavaScript.workspaceToCode(this.workSpace);
          if (this.props.setBlocklyCode) {
            this.props.setBlocklyCode(code);
          }
        };
        this.workSpace.addChangeListener(myUpdateFunction);
      });
    });
  }

}