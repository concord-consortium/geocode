import * as React from "react";
import styled from "styled-components";

interface IProps {
  setBlocklyCode?: (code: string) => void;
  width: number;
  height: number;
}

interface IState {}

const Wrapper = styled.div``;
const StartBlocks = styled.div``;
let lastTimeout: number | null  = null;
const WorkSpace = styled.div`
  font-family: sans-serif;
  width: ${(p: IProps) => `${p.width}px`};
  height: ${(p: IProps) => `${p.height}px`};
  margin: 1em;
  /* position: relative;
  border: 2px solid gray;
  border-radius: 0.5em; */
  /* padding: 1em; */
`;

export default class BlocklyContainer extends React.Component<IProps, IState> {
  private workSpace: any;
  private workSpaceRef = React.createRef<HTMLDivElement>();
  private startBlockRef = React.createRef<HTMLDivElement>();

  public render() {
    const {width, height} = this.props;
    return (
      <Wrapper>
        <StartBlocks ref={this.startBlockRef} />
        <WorkSpace width={width} height={height} ref={this.workSpaceRef} />
      </Wrapper>
    );
  }

  public componentDidMount() {
    this.initializeBlockly();
  }

  // TODO: This should eventually be removed. We save the XML to local storage.
  // We don't ever restore this at the moment, but its used by developers to
  // Save the initial program.
  public componentDidUpdate() {
    if (lastTimeout) {
      clearTimeout(lastTimeout);
    }
    lastTimeout = window.setTimeout(this.toXml, 500);
  }

  private toXml = () => {
    const xml = Blockly.Xml.workspaceToDom(this.workSpace);
    localStorage.setItem("blockly-workspace", Blockly.Xml.domToPrettyText(xml));
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
        fetch("./normal-setup.xml")
        .then((resp) => {
          resp.text().then((d) => {
            const xml = Blockly.Xml.textToDom(d);
            Blockly.Xml.domToWorkspace(xml, this.workSpace);
          });
        });
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
