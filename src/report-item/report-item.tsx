import * as React from "react";
import * as Renderer from "react-dom/server";
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
import { studentAnswerHtml } from "./student-answer-view";
interface Props {
  initMessage: IReportItemInitInteractive;
}

const getBlockList = (interactiveState: SerializedState) => {
  const { state } = interactiveState;
  const initialCode = state.blocklyStore.initialXmlCode;

  if (initialCode) {
    try {
      const domParser = new DOMParser();
      console.log(initialCode);
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

  useEffect(() => {
    addGetReportItemAnswerListener((request) => {
      const {type, platformUserId, interactiveState, authoredState} = request;

      setUserAnswers(prev => ({...prev, [platformUserId]: interactiveState}));

      const nextBlocks = getBlockList(authoredState as SerializedState);
      if (authoredBlocks.isEmpty() && !nextBlocks.isEmpty()) {
        setAuthoredBlocks(nextBlocks);
      }
      const studentBlocks = getBlockList(interactiveState as SerializedState);

      switch (type) {

        case "html":
          const html = studentAnswerHtml({authoredBlocks, studentBlocks});
          sendReportItemAnswer({type: "html", platformUserId, html});
          break;
      }
    });

    // tell the portal-report we are ready for messages
    getClient().post("reportItemClientReady");
  }, []);

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
