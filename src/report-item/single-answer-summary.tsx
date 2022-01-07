import * as React from "react";
import { IReportItemInitInteractive } from "@concord-consortium/lara-interactive-api";
import { InitMessageInfoComponent } from "./init-message-info";
import { BlockList } from "./block-list";

interface Props {
  initMessage: IReportItemInitInteractive;
  authoredBlocks: BlockList;
}

export const SingleAnswerSummaryComponent: React.FC<Props> = (props) => {
  const {authoredBlocks} = props;
  return (
    <div>
      <strong>Single Answer Summary</strong>
      <pre>{JSON.stringify(authoredBlocks.stats(), null, 2)}</pre>
      {/* <InitMessageInfoComponent initMessage={props.initMessage} /> */}
    </div>
  );
};
