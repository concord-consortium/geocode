import { types, getSnapshot } from "mobx-state-tree";
import { BlocklyStoreAuthorSettings, BlocklyStoreAuthorSettingsProps } from "./stores";

export const BlocklyStore = types
  .model("blockly", {
    xmlCode: "",                // current blockly xml code
    initialXmlCode: "",         // initial blockly xml code
    toolbox: "Everything",
    initialCodeTitle: "Basic",
    hasRunOnce: false,
  })
  .actions((self) => ({
    setBlocklyCode(code: string, workspace: any) {
      self.xmlCode = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(workspace));
    },
    setInitialXmlCode(xmlCode: string) {
      self.initialXmlCode = xmlCode;
    },
  }))
  .actions((self) => {
    return {
      loadAuthorSettingsData: (data: BlocklyStoreAuthorSettings) => {
        Object.keys(data).forEach((key: BlocklyStoreAuthorSettingsProps) => {
          // annoying `as any ... as any` is needed because we're mixing bool and non-bool props, which combine to never
          // see https://github.com/microsoft/TypeScript/issues/31663
          (self[key] as any) = data[key] as any;
        });
        // after we have loaded, set the current cml code to the initial. This will ensure that our
        // first saveable state is the same as our initial state.
        self.xmlCode = self.initialXmlCode;
      },
      runClicked: () => {
        // this does nothing but set this flag, so that we save user data on first run
        if (!self.hasRunOnce) self.hasRunOnce = true;
      },
    };
  });
export const blocklyStore = BlocklyStore.create({});

export type BlocklyStoreModelType = typeof BlocklyStore.Type;
