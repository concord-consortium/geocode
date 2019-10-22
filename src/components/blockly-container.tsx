import * as React from "react";
import styled from "styled-components";
import "../blockly-blocks/blocks.js";

interface IProps {
  toolboxPath: string;
  initialCode?: string;
  initialCodePath?: string;
  setBlocklyCode: (code: string, workspace: any) => void;
  width: number;
  height: number;
}

interface IState {}

const Wrapper = styled.div``;
const StartBlocks = styled.div``;
interface WorkspaceProps {
  width: number;
  height: number;
}
const WorkSpace = styled.div`
  font-family: sans-serif;
  width: ${(p: WorkspaceProps) => `${p.width}px`};
  height: ${(p: WorkspaceProps) => `${p.height}px`};
  border: 2px solid white;
  margin: 3px;
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
        prevProps.initialCode !== this.props.initialCode ||
        prevProps.initialCodePath !== this.props.initialCodePath) {
      this.initializeBlockly();
    }
  }

  private initializeBlockly = async () => {
    if (this.workSpaceRef.current) {
      this.workSpaceRef.current.innerHTML = "";
    }
    const {toolboxPath, initialCode, initialCodePath, setBlocklyCode} = this.props;

    let codeString = initialCode;
    if (!codeString && initialCodePath) {
      const intialCodeResp = await fetch(initialCodePath);
      codeString = await intialCodeResp.text();
    }

    const toolboxResp = await fetch(toolboxPath);
    const toolbox = await toolboxResp.text();

    const blockOpts = {
      media: "blockly/media/",
      toolbox,
      zoom: {
        startScale: 0.8,
        maxScale: 2,
        minScale: 0.2
      }
    };

    this.workSpace = Blockly.inject(this.workSpaceRef.current, blockOpts);

    Blockly.JavaScript.STATEMENT_PREFIX = "startStep(%1);\n";
    Blockly.JavaScript.STATEMENT_SUFFIX = "endStep();\n";
    Blockly.JavaScript.addReservedWords("highlightBlock");

    const xml = Blockly.Xml.textToDom(codeString);
    Blockly.Xml.domToWorkspace(xml, this.workSpace);

    const myUpdateFunction = (event: any) => {
      const code = Blockly.JavaScript.workspaceToCode(this.workSpace);
      setBlocklyCode(code, this.workSpace);
    };
    this.workSpace.addChangeListener(myUpdateFunction);
  }
}
