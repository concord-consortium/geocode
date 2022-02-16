import * as React from "react";
import { useEffect, useState } from "react";
import { IReportItemInitInteractive,
         addGetReportItemAnswerListener,
         sendReportItemAnswer,
         getClient } from "@concord-consortium/lara-interactive-api";
import { AnswerSummaryComponent } from "./answer-summary";
import { SerializedState } from "../stores/stores";
import { BlockList } from "./block-list";
import { studentAnswerHtml } from "./student-answer-view";
interface Props {
  initMessage: IReportItemInitInteractive;
}

const getBlockList = (interactiveState: SerializedState) => {
  const state  = interactiveState.state || undefined;
  const initialCode = state && state.blocklyStore && state.blocklyStore.initialXmlCode;

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
  const {view} = initMessage;
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [cachedAuthoredState, setCachedAuthoredState] = useState<SerializedState|null>(null);

  useEffect(() => {
    addGetReportItemAnswerListener((request) => {
      const {type, platformUserId, interactiveState, authoredState} = request;

      setUserAnswers(prev => ({...prev, [platformUserId]: interactiveState}));

      if (authoredState) {
        setCachedAuthoredState(authoredState as SerializedState);
      }
      const studentBlocks = getBlockList(interactiveState as SerializedState);

      switch (type) {

        case "html":
          const html = studentAnswerHtml({
            authoredState: authoredState as SerializedState || cachedAuthoredState,
            studentBlocks
          });
          sendReportItemAnswer({type: "html", platformUserId, html});
          break;
      }
    });

    // tell the portal-report we are ready for messages
    getClient().post("reportItemClientReady");
  }, []);

  return (
    <div className={`reportItem ${view}`}>
      <AnswerSummaryComponent
        initMessage={initMessage}
        authoredState={cachedAuthoredState}
        numAnswers={Object.keys(userAnswers).length}
        mode={view}
      />
    </div>
  );
};
