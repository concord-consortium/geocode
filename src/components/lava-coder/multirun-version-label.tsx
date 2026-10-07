import styled from "styled-components";

/**
 * TEMPORARY prototype marker — see docs/lavacoder/multirun-todo.md
 *
 * Identifies which build of the Multirun prototype is being looked at, so feedback can be
 * tied to a version. Not part of the feature; delete the whole file before shipping, along
 * with its two lines in app.tsx.
 *
 * Bump these two constants when cutting a version.
 */
export const kMultirunVersion = "v1.0";
export const kMultirunUpdated = "10/7/2026";

// Zero height, so the label is pinned to the top-right corner of the Blocks container without
// taking any space from the Blockly workspace below it. Self-anchoring, so neither TabPanel
// nor TabContent — both shared with the other units — needed a positioning context added.
const Anchor = styled.div`
  height: 0;
  position: relative;
  width: 100%;
`;

const Label = styled.div`
  color: #434343;
  font-size: 14px;
  position: absolute;
  right: 4px;
  top: 2px;
  white-space: nowrap;
  z-index: 1;
`;

export function MultirunVersionLabel() {
  return (
    <Anchor>
      <Label data-test="multirun-version-label">
        {`Multirun - ${kMultirunVersion} - Updated: ${kMultirunUpdated}`}
      </Label>
    </Anchor>
  );
}
