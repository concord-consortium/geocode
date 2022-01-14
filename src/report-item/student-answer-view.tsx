import * as React from "react";
import * as Renderer from "react-dom/server";
import styled from "styled-components";
import {ServerStyleSheet, StyleSheetManager} from "styled-components";

import {BlockList, IBlockStats, IBlockDiff, IBlockComment} from "./block-list";
import { style } from "d3";
import { SerializedState } from "../stores/stores";

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

const extractBlockInfo = (studentBlockList: BlockList):
  IBlockStats => {
    return studentBlockList.stats();
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

export const StudentAnswerView: React.FC<StudentAnswerProps> = (props: StudentAnswerProps) => {
  const {studentBlocks} = props;
  const blockInfo = extractBlockInfo(studentBlocks);

  return(
    <div>
      <div className="tall">
        <Container wide={false}>
          <CommentsInfo wide={false} blockInfo={blockInfo} />
        </Container>
      </div>

      <div className="wide">
        <Container wide={true}>
          <CommentsInfo wide={true} blockInfo={blockInfo} />
        </Container>
      </div>
    </div>
  );
};

export interface StudentAnswerProps {
  authoredState: SerializedState|null;
  studentBlocks: BlockList;
}

export const studentAnswerHtml = (props: StudentAnswerProps) => {
  const {authoredState, studentBlocks} = props;
  const sheet = new ServerStyleSheet();
  let results = "";
  try {
    const html = Renderer.renderToStaticMarkup(
      <StyleSheetManager sheet={sheet.instance}>
        <StudentAnswerView studentBlocks={studentBlocks} authoredState={authoredState} />
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
