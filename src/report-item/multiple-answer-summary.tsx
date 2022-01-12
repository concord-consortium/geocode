import * as React from "react";
import styled from "styled-components";

import { IReportItemInitInteractive } from "@concord-consortium/lara-interactive-api";
import { InitMessageInfoComponent } from "./init-message-info";
import { BlockList } from "./block-list";

interface Props {
  initMessage: IReportItemInitInteractive;
  authoredBlocks: BlockList;
}
const Title = styled.h1`
  font-family: helvetica, arial, sans-serif;
  color: #0592af;
  font-size: 14pt;
  font-weight: bold;
`;

const Container = styled.div`
  font-family: helvetica, arial, sans-serif;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const BlockDiv = styled.div`
  background-color: #0592af;
  color: white;
  border-radius: 5px;
  padding: 0.5em;
  margin: 2px;
  width: 75px;
`;

const BlockName = styled.div`
  margin: 2px;
  font-size: 10pt;
`;

const BlockCount = styled.div`
  margin: 2px;
  background: white;
  font-size: 10pt;
  font-weight: bold;
  color: #0592af;
  border-radius: 0.5em;
  text-align: center;
`;

const Block = (props: {name: string, count: number}) => {
  const {count, name} = props;
  return (
    <BlockDiv>
      <BlockName>{name}</BlockName>
      <BlockCount>{count}</BlockCount>
    </BlockDiv>
  );
};
export const MultipleAnswerSummaryComponent: React.FC<Props> = (props) => {
  const {authoredBlocks} = props;
  const stats = authoredBlocks.stats();
  const {blockNames} = stats;
  return (
    <>
      <Title>GeoCode Multi Answer Blockly Report</Title>
      <Container>
        { Object.keys(blockNames).map(key => <Block key={key} name={key} count={blockNames[key]} />) }
        {/* <InitMessageInfoComponent initMessage={props.initMessage} /> */}
      </Container>
    </>
  );
};
