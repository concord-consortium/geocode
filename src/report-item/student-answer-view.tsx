import * as React from "react";
import * as Renderer from "react-dom/server";
import styled from "styled-components";
import {ServerStyleSheet, StyleSheetManager} from "styled-components";

import {BlockList, IBlockStats, IBlockDiff, IBlockComment} from "./block-list";
import { style } from "d3";

export interface StudentAnswerProps {
  authoredBlocks: BlockList;
  studentBlocks: BlockList;
}

const Container = styled.div<{wide: boolean}>`
  display: flex;
  flex-direction: ${(props: any) => props.wide ? "column" : "row"};
`;

const Comments = styled.div<{wide: boolean}>`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  flex-direction: ${(props: any) => props.wide ? "row" : "column"};
  > div {
    max-width: ${(props: any) => props.wide ? "300px" : "100%"};
  }
`;

const Comment = styled.div`
  background-color: #0592af;
  color: white;
  border-radius: 5px;
  padding: 1em;
  margin: 2px;
`;

const Diff = styled.div`
  > div {
    color: white;
    padding: 0.5em;
    font-size: 12pt;
    font-family: monospace;
    font-weight: bold;
    display: inline-block;
    border-radius: 0.3em;
    margin: 2px;
    width: 2em;
    text-align: center;
  }
`;

const Missing = styled.div`
  background-color: hsl(0, 95%, 30%);
`;

const Changed = styled.div`
   background-color: hsl(40, 100%, 50%);
`;

const Added = styled.div`
  background-color: hsl(70, 95%, 30%);
`;

const CommentBlock = styled.div`
  font-weight: bold;
`;

const CommentText = styled.div`
  background-color: white;
  color: black;
  padding: 0.5em;
  border-radius: 0.25em;
  margin: 5px;
  font-size: 10pt;
  font-weight: normal;
`;

const extractBlockInfo = (studentBlockList: BlockList, authorBlockList: BlockList):
  IBlockStats & IBlockDiff => {
    const diff = studentBlockList.diff(authorBlockList);
    return {...studentBlockList.stats(), ...diff};
};

const CommentItem = (c: IBlockComment) => {
  return(
    <Comment>
      <CommentBlock>{c.blockType}
        <CommentText>"{c.comment}"</CommentText>
      </CommentBlock>
    </Comment>
  );
};

const CommentsInfo = (props: { blockInfo: IBlockStats, wide: boolean|null }) => {
  const {blockInfo, wide } = props;
  const {comments } = blockInfo;
  return(
    <Comments wide={wide || false}>
      {comments.map( (c, i) => <CommentItem key={i} blockType={c.blockType} comment={c.comment}/>)}
    </Comments>
  );
};

const Stats = (blockInfo: IBlockStats & IBlockDiff) => {
  const {addedCount, missingCount, changedCount } = blockInfo;
  return(
    <>
      <Diff>
        <Missing> -{missingCount}</Missing>
          <Added> +{addedCount}</Added>
        <Changed> Δ{changedCount}</Changed>
      </Diff>
    </>
  );
};

export const StudentAnswerView: React.FC<StudentAnswerProps> = (props: StudentAnswerProps) => {
  const {authoredBlocks, studentBlocks} = props;
  const blockInfo = extractBlockInfo(studentBlocks, authoredBlocks);

  return(
    <div>
      <div className="tall">
        <Container wide={false}>
          <Stats {...blockInfo} />
          <CommentsInfo wide={false} blockInfo={blockInfo} />
        </Container>
      </div>

      <div className="wide">
        <Container wide={true}>
          <Stats {...blockInfo} />
          <CommentsInfo wide={true} blockInfo={blockInfo} />
        </Container>
      </div>
    </div>
  );
};

export const studentAnswerHtml = (props: StudentAnswerProps) => {
  const {studentBlocks, authoredBlocks} = props;
  const sheet = new ServerStyleSheet();
  let results = "";
  try {
    const html = Renderer.renderToStaticMarkup(
      <StyleSheetManager sheet={sheet.instance}>
        <StudentAnswerView studentBlocks={studentBlocks} authoredBlocks={authoredBlocks} />
      </StyleSheetManager>
    );
    const styleTags = sheet.getStyleTags();
    results = results.concat(styleTags);
    results = results.concat(html);

  } catch (error) {
    console.error(error);
  } finally {
    sheet.seal();
  }
  return results;
};
