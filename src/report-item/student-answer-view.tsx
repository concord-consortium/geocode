import * as React from "react";
import * as Renderer from "react-dom/server";
import styled from "styled-components";
import {ServerStyleSheet, StyleSheetManager} from "styled-components";

import {BlockList, IBlockStats, IBlockComment} from "./block-list";
import { style } from "d3";
import { SerializedState } from "../stores/stores";
import SpeedDirectionWidget from "../components/widgets/speed-direction-widget";
import ColumnHeightWidget from "../components/widgets/column-height-widget";
import VEIWidget from "../components/widgets/vei-widget";
import EjectedVolumeWidget from "../components/widgets/ejected-volume-widget";

const Container = styled.div<{wide: boolean}>`
  display: flex;
  flex-direction: ${(props: any) => props.wide ? "column" : "row"};
  flex-wrap: wrap;
  > * {
    margin: 0.25em;
  }
`;

const Sim = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  > div {
    margin: 0.5em;
  }
`;

const Comments = styled.div<{wide: boolean}>`
  display: flex;
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
  padding: 0.5em;
  margin: 0.5em;
`;

const CommentBlock = styled.div`
  font-weight: bold;
`;

const CommentText = styled.div`
  background-color: white;
  color: black;
  padding: 0.5em;
  border-radius: 0.25em;
  margin-top: 0.5em;
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

export interface StudentAnswerProps {
  authoredState: SerializedState|null;
  interactiveState: SerializedState|null;
  studentBlocks: BlockList;
}

interface ITephraSimData {
  requireEruption: boolean;
  requirePainting: boolean;
  scenario:
    "Cerro Negro" | "Cerro Negro (markers)" | "Mt. St. Helens" | "Everything" |
    "Mount Pinatubo" | "Volcan de Fuego" | "Mount Ruapehu" | "Mount Fuji" |
    "Mount Vesuvius" | "Seismic CA";
  stagingColHeight: number;
  stagingMass: number;
  stagingWindDirection: number;
  stagingWindSpeed: number;
}

export const StudentAnswerView: React.FC<StudentAnswerProps> = (props: StudentAnswerProps) => {

  const {studentBlocks, interactiveState} = props;
  const blockInfo = extractBlockInfo(studentBlocks);
  const sim = (interactiveState as SerializedState).state.tephraSimulation as ITephraSimData;
  return(
    <div>
      <div className="tall">
        <Container wide={false}>
          <Sim>
            <SpeedDirectionWidget windSpeed={sim.stagingWindSpeed || 0} windDirection={sim.stagingWindDirection || 0} />
            <ColumnHeightWidget columnHeightInKilometers={sim.stagingColHeight || 0 }/>
            <VEIWidget mass={sim.stagingMass || 0} columnHeight={sim.stagingColHeight || 0} />
            <EjectedVolumeWidget volumeInKilometersCubed={sim.stagingMass || 0 / Math.pow(10, 12)} />
          </Sim>
          <CommentsInfo wide={false} blockInfo={blockInfo} />
        </Container>
      </div>

      <div className="wide">
        <Container wide={true}>
          <Sim>
            <SpeedDirectionWidget windSpeed={sim.stagingWindSpeed || 0} windDirection={sim.stagingWindDirection || 0} />
            <ColumnHeightWidget columnHeightInKilometers={sim.stagingColHeight || 0 }/>
            <VEIWidget mass={sim.stagingMass || 0} columnHeight={sim.stagingColHeight || 0} />
            <EjectedVolumeWidget volumeInKilometersCubed={sim.stagingMass || 0 / Math.pow(10, 12)} />
          </Sim>
          <CommentsInfo wide={true} blockInfo={blockInfo} />
        </Container>
      </div>
    </div>
  );
};
export const studentAnswerHtml = (props: StudentAnswerProps) => {
  const {authoredState, studentBlocks} = props;
  const sheet = new ServerStyleSheet();
  let results = "";
  try {
    const html = Renderer.renderToStaticMarkup(
      <StyleSheetManager sheet={sheet.instance}>
        <StudentAnswerView {...props}/>
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
