import React, { useEffect, useState } from "react";
import semver from "semver";
import { IReportItemInitInteractive,
         IReportItemAnswerItem,
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
  const initialCode = state?.blocklyStore?.initialXmlCode;

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
  const [userAnswers] = useState<Record<string, any>>({});
  const [cachedAuthoredState] = useState<SerializedState|null>(null);

  useEffect(() => {
      if (initMessage && initMessage.mode === "reportItem") {
        // const {interactiveItemId} = initMessage;

        addGetReportItemAnswerListener(async (request) => {
          // TODO: update lara interactive api to change addGetReportItemAnswerListener
          // to a generic with <IInteractiveState, IAuthoredState> and remove the `any` after request
          const { platformUserId, interactiveState, authoredState, version } = request as any;

          if (!version) {
            // for hosts sending older, unversioned requests
            console.error("Missing version in getReportItemAnswer request.");
          } else if (semver.satisfies(version, "2.x")) {
            const studentBlocks = getBlockList(interactiveState as SerializedState);

            const html = studentAnswerHtml({
              authoredState: authoredState as SerializedState || cachedAuthoredState,
              studentBlocks
            });
            const items: IReportItemAnswerItem[] = [
              {
                type: "links"
              },
              {
                type: "html",
                html
              }
            ];
            sendReportItemAnswer({version, platformUserId, items, itemsType: "fullAnswer"});
          } else {
            console.error("Unsupported version in getReportItemAnswer request:", version);
          }
        });
        getClient().post("reportItemClientReady");
      }
    }, [cachedAuthoredState, initMessage]);

  // do not render anything if hidden
  if (view === "hidden") {
    return null;
  }

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
