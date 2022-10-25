import { observable } from "mobx";
import { IInterpreterController, makeInterpreterController } from "./interpreter";
import { IStore } from "../stores/stores";
import { DEFORMATION_SIMULATION_WARNING } from "../strings/blockly-controller";

interface Workspace {
  highlightBlock: (id: string|null) => void;
  getBlocksByType: (name: string) => [];
}

export class BlocklyController {

  @observable
  public running = false;
  @observable
  public paused = false;
  public code = "";

  private stores: IStore;
  private interpreterController?: IInterpreterController;
  private workspace: Workspace;
  private steppingThroughBlock: boolean = false;

  public constructor(stores: IStore) {
    this.stores = stores;
  }

  public setCode = (code: string, workspace: Workspace) => {
    this.code = code;

    if (this.interpreterController) {
      this.interpreterController.stop();
      workspace.highlightBlock(null);
    }
    this.running = false;
    this.paused = false;
    this.workspace = workspace;
    this.interpreterController = makeInterpreterController(code, this, this.stores, workspace);

    this.stores.blocklyStore.setBlocklyCode(code, workspace);
    this.parseVariables();
  }

  public run = () => {
    // counting 'run from year...' blocks for deformation graph
    // if more than 3 blocks are being used, need to alert user and not run code
    const numberOfLoops = this.workspace.getBlocksByType("run-from-year-loop");
    if (numberOfLoops.length > 3) {
      this.throwError(DEFORMATION_SIMULATION_WARNING);
      this.stop();
    } else {
      this.stores.seismicSimulation.reset();
      const reset = () => {
        this.setCode(this.code, this.workspace);
      };
      if (this.interpreterController) {
        this.interpreterController.run(reset);
        this.running = true;
      }
      this.stores.chartsStore.reset();
      this.stores.samplesCollectionsStore.reset();
      this.stores.blocklyStore.runClicked();
  }
  }

  public reset = () => {
    this.setCode(this.code, this.workspace);
    this.stores.tephraSimulation.reset();
    this.stores.seismicSimulation.reset();
    this.stores.chartsStore.reset();
    this.stores.samplesCollectionsStore.reset();
  }

  public stop = () => {
    if (this.interpreterController) {
      this.interpreterController.stop();
      this.running = false;
      this.paused = false;
    }
  }

  // pauses the interpreter run without setting self.running = false
  public pause = () => {
    if (this.interpreterController) {
      this.interpreterController.pause();
      this.paused = true;
    }
  }

  // only restarts if self.running = true. If user hit stop between `pause` and this
  // function, this won't restart the run.
  public unpause = () => {
    if (this.interpreterController && this.running) {
      const reset = () => {
        this.setCode(this.code, this.workspace);
      };
      this.interpreterController.run(reset);
      this.paused = false;
    }
  }

  /**
   * Steps through one complete block.
   * This sets steppingThroughBlock to true, and then repeatedly calls `step` on the interpreter
   * until steppingThroughBlock is false. All blocks are wrapped with code that will call endStep
   * at the end of the block's function, which will set steppingThroughBlock to false.
   */
  public step = () => {
    const numberOfLoops = this.workspace.getBlocksByType("run-from-year-loop");
    if (numberOfLoops.length > 3) {
      this.throwError(DEFORMATION_SIMULATION_WARNING);
      this.stop();
    } else {
    this.steppingThroughBlock = true;

    // guard against infinite loops or a block failing to call endStep
    const maxInvocations = 100;
    let invocations = 0;

    const stepAsync = () => {
      if (this.interpreterController) {
        this.interpreterController.step();
      }
      if (this.steppingThroughBlock && invocations++ < maxInvocations) {
        setTimeout(stepAsync, 0); // async to allow endStep to be called
      }
    };
    stepAsync();
    }
  }

  // called by interpreted block code
  public startStep = () => {
    // anything we need to do at start of step (previously we turned off
    // animation before moving to next block)
  }

  // called by interpreted block code
  public endStep = () => {
    this.steppingThroughBlock = false;
  }

  public throwError = (errorMessage: string) => {
    this.pause();
    alert(errorMessage);
    this.reset();
  }

  /**
   * This manually parses code to find fields that the user has named, for use
   * in pull-down menus or similar. This is essentially doing what Blockly's
   * variables system does, without the hassle of dealing with Blockly's custom
   * variable syntax and dynamic creation of blocks to deal with them.
   *
   * Currently we parse for is the "create_sample_location" and "create_sample_collection"
   * blocks, so that we can populate the relevant dropdowns.
   *
   * Note that this process doesn't actually create a samplesCollection, that happens
   * when the code is actually run.
   */
  private parseVariables() {
    const sampleLocationsRegex = /createSampleLocation\({name: "([^"]*)"/gm;
    const sampleCollectionsRegex = /createSampleCollection\({name: "([^"]*)"/gm;

    const findValues = (regex: RegExp) => {
      const results = [];
      let match;
      // tslint:disable-next-line
      while ((match = regex.exec(this.code)) !== null) {
        const value = match[1];
        if (value) results.push([value, value]);   // dropdowns need two strings
      }
      return results;
    };

    (Blockly as any).sampleLocations = findValues(sampleLocationsRegex);
    (Blockly as any).sampleCollections = findValues(sampleCollectionsRegex);
  }
}
