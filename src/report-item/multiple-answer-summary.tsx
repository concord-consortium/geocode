import * as React from "react";
import { IReportItemInitInteractive } from "@concord-consortium/lara-interactive-api";
import { InitMessageInfoComponent } from "./init-message-info";
import { BlockList } from "./block-list";

interface Props {
  initMessage: IReportItemInitInteractive;
  authoredBlocks: BlockList;
}

export const MultipleAnswerSummaryComponent: React.FC<Props> = (props) => {
  return (
    <div>
      <strong>Multiple Answer Summary</strong>
      {/* <InitMessageInfoComponent initMessage={props.initMessage} /> */}
    </div>
  );
};
