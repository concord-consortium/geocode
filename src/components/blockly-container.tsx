import * as React from "react";
import styled from "styled-components";
import "../blockly-blocks/blocks.js";

let loadingUID: number;

interface IProps {
  toolboxPath: string;
  initialCode?: string;
  initialCodePath?: string;
  setBlocklyCode: (code: string, workspace: any) => void;
  width: number;
  height: number;
  hideToolbox: boolean;
}

interface IState {
  containerWidth: number;
  containerHeight: number;
}

const Wrapper = styled.div`
  flex: 1 1 auto;
  justify-content: flex-start;
`;
const StartBlocks = styled.div``;
interface WorkspaceProps {
  width: number;
  height: number;
}
const WorkSpace = styled.div`
  font-family: sans-serif;
  width: ${(p: WorkspaceProps) => `${p.width}px`};
  height: ${(p: WorkspaceProps) => `${p.height}px`};
`;

export default class BlocklyContainer extends React.Component<IProps, IState> {
  private workSpace: any;
  private workSpaceRef = React.createRef<HTMLDivElement>();
  private startBlockRef = React.createRef<HTMLDivElement>();

  constructor(props: IProps) {
    super(props);
    this.state = {
      containerWidth: 0,
      containerHeight: 0,
    };
  }

  public render() {
    const {width, height, hideToolbox} = this.props;
    return (
      <Wrapper>
        <StartBlocks ref={this.startBlockRef} />
        <WorkSpace width={width} height={height} ref={this.workSpaceRef} />
      </Wrapper>
    );
  }

  public componentDidMount() {
    this.initializeBlockly();
    this.setupBlockly();
  }

  public componentDidUpdate(prevProps: IProps) {
    if ((prevProps.toolboxPath !== this.props.toolboxPath) ||
        prevProps.initialCode !== this.props.initialCode ||
        prevProps.initialCodePath !== this.props.initialCodePath ||
        prevProps.hideToolbox !== this.props.hideToolbox) {
      this.setupBlockly();
    }
    if (this.workSpaceRef.current) {
      const { offsetHeight, offsetWidth } = this.workSpaceRef.current;
      if ((this.state.containerHeight !== offsetHeight || this.state.containerWidth !== offsetWidth) &&
          (offsetHeight !== 0 && offsetWidth !== 0)) {
        this.setState({ containerHeight: offsetHeight, containerWidth: offsetWidth });
        Blockly.svgResize(this.workSpace);
      }
    }
  }

  private initializeBlockly = () => {
    const {setBlocklyCode, hideToolbox} = this.props;

    Blockly.JavaScript.STATEMENT_PREFIX = "startStep(%1);\n";
    Blockly.JavaScript.STATEMENT_SUFFIX = "endStep();\n";
    Blockly.JavaScript.addReservedWords("highlightBlock");

    // initialize blockly with options.
    // note: we need to pass in a toolbox, and it has to have categories, otherwise blockly
    // won't let us update the toolbox later with another def that includes categories
    const blockOpts = {
      media: "blockly/media/",
      toolbox: `
      <xml id="toolbox" style="display: none">
        <category name="Loading...">
        </category>
      </xml>
      `,
      zoom: {
        startScale: 0.8,
        maxScale: 2,
        minScale: 0.2
      }
    };

    if (hideToolbox) {
      delete blockOpts.toolbox;
    }

    this.workSpace = Blockly.inject(this.workSpaceRef.current, blockOpts);

    const myUpdateFunction = (event: any) => {
      const code = Blockly.JavaScript.workspaceToCode(this.workSpace);
      setBlocklyCode(code, this.workSpace);
    };

    this.workSpace.addChangeListener(myUpdateFunction);
  }

  private setupBlockly = async () => {
    const {toolboxPath, initialCode, initialCodePath, hideToolbox} = this.props;

    // because we may be loading in code and toolboxes asynchronously, this function may
    // occasionally complete after newer invocations have completed, overwriting the newer
    // setup. This is a quick check that only the most recent invocation will be honored.
    const currentLoadingUID = Math.random();
    loadingUID = currentLoadingUID;

    let codeString = initialCode;
    if (!codeString && initialCodePath) {
      const intialCodeResp = await fetch(initialCodePath);
      codeString = await intialCodeResp.text();
    }

    if (codeString) {
      // convert string to XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(codeString, "text/xml");
      // get the blocks from the XML
      const xmlBlocks = xmlDoc.getElementsByTagName("block");
      if (xmlBlocks.length) {
        // find min and max x,y of blocks
        let minX;
        let minY;
        for (const block of xmlBlocks as any) {
          const x = block.getAttribute("x");
          const y = block.getAttribute("y");
          if (x && y) {
            minX = minX ? Math.min(x, minX) : x;
            minY = minY ? Math.min(y, minY) : y;
          }
        }

        // adjust program position
        const kWorkspacePadding = 10;
        const xDelta = kWorkspacePadding - minX;
        const yDelta = kWorkspacePadding - minY;
        if (xDelta !== 0 || yDelta !== 0) {
          for (const block of xmlBlocks as any) {
            const x = block.getAttribute("x");
            const y = block.getAttribute("y");
            if (x && y) {
              const newX = parseInt(x, 10) + xDelta;
              const newY = parseInt(y, 10) + yDelta;
              block.setAttribute("x", newX.toString());
              block.setAttribute("y", newY.toString());
            }
          }
        }

        const serializer = new XMLSerializer();
        const newXmlStr = serializer.serializeToString(xmlDoc);
        codeString = newXmlStr;
      }
    }

    const toolboxResp = await fetch(toolboxPath);
    const toolbox = await toolboxResp.text();

    if (loadingUID !== currentLoadingUID) {
      return;
    }

    this.workSpace.clear();

    if (hideToolbox) {
      // the only way to remove a toolbox is to destroy blockly and recreate it without one
      this.workSpace.dispose();
      this.initializeBlockly();
    } else {
      this.workSpace.updateToolbox(toolbox);
    }

    const xml = Blockly.Xml.textToDom(codeString);
    Blockly.Xml.domToWorkspace(xml, this.workSpace);
  }
}
