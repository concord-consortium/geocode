import * as React from "react";
import styled from "styled-components";
import "../blockly-blocks/blocks.js";

interface IProps {
  toolboxPath: string;
  initialCodeSetupPath: string;
  setBlocklyCode: (code: string, workspace: any) => void;
  width: number;
  height: number;
}

interface IState {}

const Wrapper = styled.div``;
const StartBlocks = styled.div``;
let lastTimeout: number | null  = null;
interface WorkspaceProps {
  width: number;
  height: number;
}
const WorkSpace = styled.div`
  font-family: sans-serif;
  width: ${(p: WorkspaceProps) => `${p.width}px`};
  height: ${(p: WorkspaceProps) => `${p.height}px`};
  margin: 1em;
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

  public componentDidUpdate(prevProps: IProps) {
    if ((prevProps.toolboxPath !== this.props.toolboxPath) ||
        prevProps.initialCodeSetupPath !== this.props.initialCodeSetupPath) {
          this.initializeBlockly();
        }

    // TODO: This should eventually be removed. We save the XML to local storage.
    // We don't ever restore this at the moment, but its used by developers to
    // Save the initial program.
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
    if (this.workSpaceRef.current) {
      this.workSpaceRef.current.innerHTML = "";
    }
    const {toolboxPath, initialCodeSetupPath, setBlocklyCode} = this.props;
    fetch(toolboxPath).then((r) => {
      r.text().then( (data) => {
        const blockOpts = {
          media: "blockly/media/",
          toolbox: data,
          zoom: {
            startScale: 0.8,
            maxScale: 2,
            minScale: 0.2
          }
        };
        this.workSpace = Blockly.inject(this.workSpaceRef.current, blockOpts);
        const startBlocks = this.startBlockRef.current;
        Blockly.Xml.domToWorkspace(startBlocks, this.workSpace);
        Blockly.JavaScript.STATEMENT_PREFIX = "startStep(%1);\n";
        Blockly.JavaScript.STATEMENT_SUFFIX = "endStep();\n";
        Blockly.JavaScript.addReservedWords("highlightBlock");
        fetch(initialCodeSetupPath)
        .then((resp) => {
          resp.text().then((d) => {
            const xml = Blockly.Xml.textToDom(d);
            Blockly.Xml.domToWorkspace(xml, this.workSpace);
          });
        });
        const myUpdateFunction = (event: any) => {
          const code = Blockly.JavaScript.workspaceToCode(this.workSpace);
          setBlocklyCode(code, this.workSpace);
        };
        this.workSpace.addChangeListener(myUpdateFunction);
      });
    });
  }

}
