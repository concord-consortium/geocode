import * as React from "react";
import ReactDOMServer from 'react-dom/server';

import { useEffect, useState } from "react";
import { IReportItemInitInteractive,
         addGetReportItemAnswerListener,
         sendReportItemAnswer,
         getClient } from "@concord-consortium/lara-interactive-api";
import { MultipleAnswerSummaryComponent } from "./multiple-answer-summary";
import { SingleAnswerSummaryComponent } from "./single-answer-summary";
import { string } from "prop-types";
import { array } from "mobx-state-tree/dist/internal";
import { SerializedState } from "../stores/stores";
import { BlockList } from "./block-list";

const s = ReactDomServer;
interface Props {
  initMessage: IReportItemInitInteractive;
}

const getBlockList = (interactiveState: SerializedState) => {
  const { state } = interactiveState;
  const initialCode = state.blocklyStore.initialXmlCode;

  if (initialCode) {
    try {
      const domParser = new DOMParser();
      const doc = domParser.parseFromString(initialCode, "text/xml");
      return new BlockList(doc);
    }
    catch (e) {
      console.error(e);
    }
  }
  return new BlockList(null);
};

export const ReportItemComponent: React.FC<Props> = (props) => {
  const {initMessage} = props;
  const {users, view} = initMessage;
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [authoredBlocks, setAuthoredBlocks] = useState<BlockList>(new BlockList(null));

  // TODO compare with another set of blocks ....
  const extractBlockInfo = (studentBlockList: BlockList, authorBlockList: BlockList) => {
    const diff = studentBlockList.diff(authorBlockList);
    return {...studentBlockList.stats(), ...diff};
  };

  useEffect(() => {
    // This method should return two Divs:
    // - one .tall and one .wide div.
    // - the portal-report will hide the appropriate div at
    addGetReportItemAnswerListener((request) => {
      const {type, platformUserId, interactiveState, authoredState} = request;
      console.log("authored state:", authoredState);
      setUserAnswers(prev => ({...prev, [platformUserId]: interactiveState}));
      const nextBlocks = getBlockList(authoredState as SerializedState);
      if (authoredBlocks.isEmpty() && !nextBlocks.isEmpty()) {
        setAuthoredBlocks(nextBlocks);
      }
      const studentBlocks = getBlockList(interactiveState as SerializedState);
      const blockInfo = extractBlockInfo(studentBlocks, authoredBlocks);
      const abs = authoredBlocks.stats().allBlcocks;
      const sbs = studentBlocks.stats().allBlcocks;
      console.log("blockInfo:", blockInfo);
      const {numBlocks, numComments, comments, addedCount, missingCount, changedCount } = blockInfo;
      switch (type) {
        case "html":

          const html = `
            <style>
               h1 {
                color: #0592af;
                font-size: 16pt;
                font-weight: bold;
              }
               .comments {
                display: flex;
                flex-direction: column;
              }
              .wide > .comments {
                flex-direction: row;
                flex-wrap: wrap;
              }
              .comment {
                background-color: #0592af;
                color: white;
                border-radius: 5px;
                padding: 1em;
                margin: 2px;
              }
              .block-for-comment{
                font-weight: bold;
              }
              .diff > div {
                color: white;
                padding: 0.5em;
                font-family: monospace;
                font-weight: bold;
                display: inline-block;
                border-radius: 0.3em;
              }
              .added {
                background-color: #052e05;
              }
              .missing {
                background-color: hsl(45, 80%, 20%);
              }
              .changed {
                background-color: hsl(0, 80%, 20%);
              }
            </style>
            <div class="tall">
              <h1>Geocode Blockly report</h1>
              <div>
                <div>"${abs}"</div>
                <div>"${sbs}"</div>
                <div class = "diff">
                  <div class = "missing"> -${missingCount}</div>
                  <div class = "changed"> Δ${changedCount}</div>
                  <div class = "added"> +${addedCount}</div>
                </div>
                <div class = "comments">
                  ${comments.map(c => {
                    return `
                      <div class="comment">
                        <div class="block-for-comment">${c.blockType}</div>
                        <div class="comment-content">"${c.comment}"</div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            </div>
            <div class="wide">
                <div class = "comments">
                  <div>
                    <strong> ${numBlocks} Blocks used</strong>
                    <strong>  ${numComments} Comments</strong>:
                  </div>
                  ${comments.map(c => {
                    return `
                      <div class="comment">
                        <div class="block-for-comment">${c.blockType}</div>
                        <div class="comment-content">"${c.comment}"</div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            </div>
          `;
          sendReportItemAnswer({type: "html", platformUserId, html});
          break;
      }
    });

    // tell the portal-report we are ready for messages
    getClient().post("reportItemClientReady");
  }, [authoredBlocks]);

  return (
    <div className={`reportItem ${view}`}>
      {view === "singleAnswer"
        ? <SingleAnswerSummaryComponent
            initMessage={initMessage}
            authoredBlocks={authoredBlocks}
          />
        : <MultipleAnswerSummaryComponent
            initMessage={initMessage}
            authoredBlocks={authoredBlocks}
          />
      }
    </div>
  );
};
